import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { render } from '@react-email/render';
import { startOfDay, addDays, differenceInDays, format } from 'date-fns';
import {
  DailyDigestEmail,
  type DigestData,
  type DigestTask,
  type DigestRenewal,
} from './emails/daily-digest.js';
import { BirthdayGreetingEmail } from './emails/birthday-greeting.js';
import { RenewalReminderEmail } from './emails/renewal-reminder.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly zeptoApiKey: string | null = null;
  private readonly fromAddress: string;
  private readonly fromName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('ZEPTOMAIL_API_KEY');
    if (apiKey) {
      this.zeptoApiKey = apiKey;
      this.logger.log('ZeptoMail configured');
    } else {
      this.logger.warn(
        'ZEPTOMAIL_API_KEY not configured. Email sending disabled.',
      );
    }

    this.fromAddress =
      this.configService.get<string>('ZEPTOMAIL_FROM_ADDRESS') ??
      'noreply@anchor.com';
    this.fromName =
      this.configService.get<string>('ZEPTOMAIL_FROM_NAME') ?? 'Anchor';
  }

  /**
   * Check if email sending is configured.
   */
  get isEmailConfigured(): boolean {
    return !!this.zeptoApiKey;
  }

  /**
   * Generic email sending method. Reusable across all email types.
   */
  async sendEmail(params: {
    to: string;
    toName?: string;
    subject: string;
    html: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.zeptoApiKey) {
      this.logger.warn('ZeptoMail not configured.');
      return { success: false, error: 'ZeptoMail not configured' };
    }
    try {
      const response = await fetch('https://api.zeptomail.com/v1.1/email', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Zoho-enczapikey ${this.zeptoApiKey}`,
        },
        body: JSON.stringify({
          from: { address: this.fromAddress, name: this.fromName },
          to: [{ email_address: { address: params.to, name: params.toName } }],
          subject: params.subject,
          htmlbody: params.html,
        }),
      });
      if (!response.ok) {
        const body = await response.text();
        this.logger.error(`ZeptoMail error (${response.status}): ${body}`);
        return { success: false, error: `${response.status}: ${body}` };
      }
      return { success: true };
    } catch (error) {
      this.logger.error(`sendEmail failed: ${error}`);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Batch email sending for bulk sends (up to 500 recipients per API call).
   */
  async sendBatchEmail(params: {
    recipients: Array<{ email: string; name?: string }>;
    subject: string;
    html: string;
  }): Promise<{ success: boolean; sentCount: number; error?: string }> {
    if (!this.zeptoApiKey) {
      return { success: false, sentCount: 0, error: 'ZeptoMail not configured' };
    }
    const BATCH_SIZE = 500;
    let totalSent = 0;
    try {
      for (let i = 0; i < params.recipients.length; i += BATCH_SIZE) {
        const batch = params.recipients.slice(i, i + BATCH_SIZE);
        const response = await fetch(
          'https://api.zeptomail.com/v1.1/email/batch',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Zoho-enczapikey ${this.zeptoApiKey}`,
            },
            body: JSON.stringify({
              from: { address: this.fromAddress, name: this.fromName },
              to: batch.map((r) => ({
                email_address: { address: r.email, name: r.name },
              })),
              subject: params.subject,
              htmlbody: params.html,
            }),
          },
        );
        if (!response.ok) {
          const body = await response.text();
          this.logger.error(`Batch email error: ${response.status}: ${body}`);
          return {
            success: false,
            sentCount: totalSent,
            error: `${response.status}: ${body}`,
          };
        }
        totalSent += batch.length;
      }
      return { success: true, sentCount: totalSent };
    } catch (error) {
      this.logger.error(`sendBatchEmail failed: ${error}`);
      return { success: false, sentCount: totalSent, error: String(error) };
    }
  }

  /**
   * Send daily digest emails for all tenants.
   * Called by the scheduler at 8 AM.
   * CRITICAL: Uses raw this.prisma -- cron job has no HTTP context, no CLS tenant.
   */
  async sendDailyDigestForAllTenants(): Promise<void> {
    this.logger.log('Starting daily digest for all tenants...');

    if (!this.zeptoApiKey) {
      this.logger.warn('ZeptoMail not configured. Skipping daily digest.');
      return;
    }

    try {
      // Get all tenants
      const tenants = await this.prisma.tenant.findMany({
        select: { id: true, name: true },
      });

      this.logger.log(`Found ${tenants.length} tenant(s) for daily digest`);

      for (const tenant of tenants) {
        try {
          await this.sendDigestForTenant(tenant.id);
        } catch (error) {
          this.logger.error(
            `Failed to send digest for tenant ${tenant.id}: ${error}`,
          );
        }
      }

      this.logger.log('Daily digest completed for all tenants');
    } catch (error) {
      this.logger.error(`Daily digest failed: ${error}`);
    }
  }

  /**
   * Send digest emails to all users in a tenant who haven't opted out.
   */
  private async sendDigestForTenant(tenantId: string): Promise<void> {
    // Get users who haven't opted out
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        digestOptOut: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailRenewalReminders: true,
      },
    });

    if (users.length === 0) {
      this.logger.debug(`No users to send digest for tenant ${tenantId}`);
      return;
    }

    for (const user of users) {
      try {
        const digestData = await this.getDigestDataForUser(
          tenantId,
          user.id,
        );

        // Strip renewal milestones if user opted out of email renewal reminders
        if (!user.emailRenewalReminders) {
          digestData.renewalMilestones = [];
        }

        // Skip empty digests
        if (
          digestData.overdueTasks.length === 0 &&
          digestData.renewalMilestones.length === 0
        ) {
          this.logger.debug(
            `Skipping empty digest for user ${user.email}`,
          );
          continue;
        }

        await this.sendDigestToUser(user.email, {
          ...digestData,
          userName: user.firstName,
          date: format(new Date(), 'MMMM d, yyyy'),
        });

        this.logger.log(`Digest sent to ${user.email}`);
      } catch (error) {
        this.logger.error(
          `Failed to send digest to ${user.email}: ${error}`,
        );
      }
    }
  }

  /**
   * Get digest data for a specific user within a tenant.
   * CRITICAL: Uses raw this.prisma with manual tenantId (no CLS context in cron).
   */
  async getDigestDataForUser(
    tenantId: string,
    userId: string,
  ): Promise<Omit<DigestData, 'userName' | 'date'>> {
    const today = startOfDay(new Date());
    const in61Days = addDays(today, 61);

    const [overdueTasks, renewalMilestones] = await Promise.all([
      // Overdue tasks: dueDate < today, status != done
      this.prisma.task.findMany({
        where: {
          tenantId,
          dueDate: { lt: today },
          status: { not: 'done' },
        },
        include: {
          client: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 20,
      }),

      // Renewal milestones: type = renewal, status = todo, dueDate within 61 days
      // CRITICAL: 61-day window covers ALL milestone intervals (60/30/7 days)
      this.prisma.task.findMany({
        where: {
          tenantId,
          type: 'renewal',
          status: 'todo',
          dueDate: {
            gte: today,
            lte: in61Days,
          },
        },
        include: {
          client: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 30,
      }),
    ]);

    return {
      overdueTasks: overdueTasks.map(
        (task): DigestTask => ({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          clientName: task.client
            ? `${task.client.firstName} ${task.client.lastName}`
            : null,
          priority: task.priority,
        }),
      ),
      renewalMilestones: renewalMilestones.map(
        (task): DigestRenewal => ({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          clientName: task.client
            ? `${task.client.firstName} ${task.client.lastName}`
            : null,
          daysRemaining: task.dueDate
            ? differenceInDays(task.dueDate, today)
            : null,
        }),
      ),
    };
  }

  /**
   * Render and send the digest email to a user via ZeptoMail.
   * Delegates to the generic sendEmail() method.
   */
  private async sendDigestToUser(
    email: string,
    data: DigestData,
  ): Promise<void> {
    try {
      const html = await render(DailyDigestEmail(data));

      const result = await this.sendEmail({
        to: email,
        subject: `Anchor Daily Digest - ${data.date}`,
        html,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      this.logger.error(`Failed to send digest email to ${email}: ${error}`);
      throw error;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Birthday Emails
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Send birthday emails for all tenants.
   * Called by the scheduler at 7:30 AM Toronto time.
   * CRITICAL: Uses raw this.prisma -- cron job has no HTTP context, no CLS tenant.
   */
  async sendBirthdayEmailsForAllTenants(): Promise<void> {
    this.logger.log('Starting birthday emails for all tenants...');

    if (!this.zeptoApiKey) {
      this.logger.warn('ZeptoMail not configured. Skipping birthday emails.');
      return;
    }

    try {
      const tenants = await this.prisma.tenant.findMany({
        select: { id: true, name: true },
      });

      this.logger.log(`Found ${tenants.length} tenant(s) for birthday emails`);

      for (const tenant of tenants) {
        try {
          await this.sendBirthdayEmailsForTenant(tenant.id, tenant.name);
        } catch (error) {
          this.logger.error(
            `Failed birthday emails for tenant ${tenant.id}: ${error}`,
          );
        }
      }

      this.logger.log('Birthday emails completed for all tenants');
    } catch (error) {
      this.logger.error(`Birthday emails failed: ${error}`);
    }
  }

  /**
   * Send birthday emails for a single tenant.
   * Checks TenantEmailSettings, queries clients with birthday today (Toronto TZ),
   * checks idempotency via EmailLog, sends email, and logs result.
   */
  private async sendBirthdayEmailsForTenant(
    tenantId: string,
    tenantName: string,
  ): Promise<void> {
    // Check TenantEmailSettings
    const settings = await this.prisma.tenantEmailSettings.findUnique({
      where: { tenantId },
    });

    if (settings && settings.birthdayEmailsEnabled === false) {
      this.logger.debug(
        `Birthday emails disabled for tenant ${tenantId}. Skipping.`,
      );
      return;
    }

    // Get today's month and day in Toronto timezone
    const torontoNow = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' }),
    );
    const month = torontoNow.getMonth() + 1;
    const day = torontoNow.getDate();

    // Query clients with birthday today
    const clients = await this.prisma.$queryRaw<
      Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      }>
    >`
      SELECT id, first_name AS "firstName", last_name AS "lastName", email
      FROM clients
      WHERE tenant_id = ${tenantId}::uuid
        AND date_of_birth IS NOT NULL
        AND email IS NOT NULL
        AND email != ''
        AND EXTRACT(MONTH FROM date_of_birth) = ${month}
        AND EXTRACT(DAY FROM date_of_birth) = ${day}
    `;

    if (clients.length === 0) {
      this.logger.debug(
        `No birthday clients today for tenant ${tenantId}`,
      );
      return;
    }

    this.logger.log(
      `Found ${clients.length} birthday client(s) for tenant ${tenantId}`,
    );

    for (const client of clients) {
      try {
        // Idempotency check via EmailLog
        const alreadySent = await this.prisma.emailLog.findFirst({
          where: {
            tenantId,
            clientId: client.id,
            type: 'birthday_greeting',
            sentAt: { gte: startOfDay(torontoNow) },
          },
        });
        if (alreadySent) {
          this.logger.debug(
            `Birthday email already sent to ${client.email} today. Skipping.`,
          );
          continue;
        }

        // Render template
        const html = await render(
          BirthdayGreetingEmail({
            clientName: client.firstName,
            agencyName: tenantName,
          }),
        );

        // Send email
        const subject = `Happy Birthday, ${client.firstName}!`;
        const result = await this.sendEmail({
          to: client.email,
          toName: `${client.firstName} ${client.lastName}`,
          subject,
          html,
        });

        // Log to EmailLog
        await this.prisma.emailLog.create({
          data: {
            tenantId,
            clientId: client.id,
            recipientEmail: client.email,
            type: 'birthday_greeting',
            subject,
            status: result.success ? 'sent' : 'failed',
            errorMessage: result.error || null,
          },
        });

        if (result.success) {
          this.logger.log(`Birthday email sent to ${client.email}`);
        } else {
          this.logger.warn(
            `Birthday email failed for ${client.email}: ${result.error}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error processing birthday email for client ${client.id}: ${error}`,
        );
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Renewal Reminder Emails
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Send renewal reminder emails for all tenants.
   * Called by the scheduler at 7:00 AM Toronto time.
   * CRITICAL: Uses raw this.prisma -- cron job has no HTTP context, no CLS tenant.
   */
  async sendRenewalReminderEmailsForAllTenants(): Promise<void> {
    this.logger.log('Starting renewal reminder emails for all tenants...');

    if (!this.zeptoApiKey) {
      this.logger.warn(
        'ZeptoMail not configured. Skipping renewal reminders.',
      );
      return;
    }

    try {
      const tenants = await this.prisma.tenant.findMany({
        select: { id: true, name: true },
      });

      this.logger.log(
        `Found ${tenants.length} tenant(s) for renewal reminders`,
      );

      for (const tenant of tenants) {
        try {
          await this.sendRenewalReminderEmailsForTenant(
            tenant.id,
            tenant.name,
          );
        } catch (error) {
          this.logger.error(
            `Failed renewal reminders for tenant ${tenant.id}: ${error}`,
          );
        }
      }

      this.logger.log('Renewal reminder emails completed for all tenants');
    } catch (error) {
      this.logger.error(`Renewal reminder emails failed: ${error}`);
    }
  }

  /**
   * Send renewal reminder emails for a single tenant.
   * Checks TenantEmailSettings to determine which intervals are active,
   * then sends reminders for each active interval.
   */
  private async sendRenewalReminderEmailsForTenant(
    tenantId: string,
    tenantName: string,
  ): Promise<void> {
    // Load TenantEmailSettings. Default all to true if no settings exist.
    const settings = await this.prisma.tenantEmailSettings.findUnique({
      where: { tenantId },
    });

    // Build array of active intervals based on settings
    const intervals: number[] = [];
    if (settings?.renewalReminder60Days !== false) intervals.push(60);
    if (settings?.renewalReminder30Days !== false) intervals.push(30);
    if (settings?.renewalReminder7Days !== false) intervals.push(7);

    if (intervals.length === 0) {
      this.logger.debug(
        `All renewal reminder intervals disabled for tenant ${tenantId}. Skipping.`,
      );
      return;
    }

    for (const daysBefore of intervals) {
      try {
        await this.sendRenewalRemindersForInterval(
          tenantId,
          tenantName,
          daysBefore,
        );
      } catch (error) {
        this.logger.error(
          `Failed renewal reminders (${daysBefore}d) for tenant ${tenantId}: ${error}`,
        );
      }
    }
  }

  /**
   * Send renewal reminders for a specific interval (e.g. 60, 30, or 7 days before expiry).
   * Queries policies expiring on the target date, checks idempotency via EmailLog,
   * renders template, sends email, and logs result.
   */
  private async sendRenewalRemindersForInterval(
    tenantId: string,
    tenantName: string,
    daysBefore: number,
  ): Promise<void> {
    // Use Toronto timezone for "today" calculation
    const torontoNow = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' }),
    );

    // Calculate target date
    const targetDate = startOfDay(addDays(torontoNow, daysBefore));
    const nextDay = startOfDay(addDays(targetDate, 1));

    // Query policies expiring on targetDate
    const policies = await this.prisma.policy.findMany({
      where: {
        tenantId,
        status: { in: ['active', 'pending_renewal'] },
        endDate: { gte: targetDate, lt: nextDay },
        client: { email: { not: null } },
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    // Additionally filter out policies where client email is empty string
    const validPolicies = policies.filter(
      (p) => p.client.email && p.client.email.trim() !== '',
    );

    if (validPolicies.length === 0) {
      this.logger.debug(
        `No policies expiring in ${daysBefore} days for tenant ${tenantId}`,
      );
      return;
    }

    this.logger.log(
      `Found ${validPolicies.length} policy/policies expiring in ${daysBefore} days for tenant ${tenantId}`,
    );

    for (const policy of validPolicies) {
      try {
        // Idempotency check: two-step approach (no Prisma JSON path filtering)
        const todayLog = await this.prisma.emailLog.findFirst({
          where: {
            tenantId,
            clientId: policy.client.id,
            type: 'renewal_reminder',
            sentAt: { gte: startOfDay(torontoNow) },
          },
        });
        if (todayLog) {
          const meta = todayLog.metadata as Record<string, unknown> | null;
          if (meta && meta.policyId === policy.id) {
            this.logger.debug(
              `Renewal reminder already sent for policy ${policy.id} today. Skipping.`,
            );
            continue;
          }
        }

        // Determine policy type display name
        const policyType = policy.customType || policy.type;

        // Format expiry date
        const expiryDate = policy.endDate
          ? format(policy.endDate, 'MMMM d, yyyy')
          : 'Unknown';

        // Agent info
        const agentName = policy.createdBy
          ? `${policy.createdBy.firstName} ${policy.createdBy.lastName}`.trim()
          : null;
        const agentEmail = policy.createdBy?.email || null;

        // Render template
        const html = await render(
          RenewalReminderEmail({
            clientName: policy.client.firstName,
            agencyName: tenantName,
            policyType,
            policyNumber: policy.policyNumber,
            expiryDate,
            daysRemaining: daysBefore,
            agentName: agentName || null,
            agentEmail,
          }),
        );

        // Send email
        const subject = `Your ${policyType} policy expires in ${daysBefore} days`;
        const result = await this.sendEmail({
          to: policy.client.email!,
          toName: `${policy.client.firstName} ${policy.client.lastName}`,
          subject,
          html,
        });

        // Log to EmailLog with metadata
        await this.prisma.emailLog.create({
          data: {
            tenantId,
            clientId: policy.client.id,
            recipientEmail: policy.client.email!,
            type: 'renewal_reminder',
            subject,
            status: result.success ? 'sent' : 'failed',
            errorMessage: result.error || null,
            metadata: { policyId: policy.id, daysBefore },
          },
        });

        if (result.success) {
          this.logger.log(
            `Renewal reminder (${daysBefore}d) sent for policy ${policy.id} to ${policy.client.email}`,
          );
        } else {
          this.logger.warn(
            `Renewal reminder failed for policy ${policy.id}: ${result.error}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error processing renewal reminder for policy ${policy.id}: ${error}`,
        );
      }
    }
  }
}
