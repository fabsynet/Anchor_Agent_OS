import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service.js';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Renewal reminder email cron job.
   * Runs at 7:00 AM Toronto time (Eastern), every day.
   * Sends reminders for policies expiring in 60, 30, or 7 days (configurable per tenant).
   */
  @Cron('0 0 7 * * *', { timeZone: 'America/Toronto' })
  async handleRenewalReminderEmails(): Promise<void> {
    this.logger.log('Renewal reminder email cron triggered');
    try {
      await this.notificationsService.sendRenewalReminderEmailsForAllTenants();
      this.logger.log('Renewal reminder email cron completed');
    } catch (error) {
      this.logger.error(`Renewal reminder email cron failed: ${error}`);
    }
  }

  /**
   * Birthday email cron job.
   * Runs at 7:30 AM Toronto time (Eastern), every day.
   * Sends birthday greetings to clients whose birthday is today.
   */
  @Cron('0 30 7 * * *', { timeZone: 'America/Toronto' })
  async handleBirthdayEmails(): Promise<void> {
    this.logger.log('Birthday email cron triggered');
    try {
      await this.notificationsService.sendBirthdayEmailsForAllTenants();
      this.logger.log('Birthday email cron completed');
    } catch (error) {
      this.logger.error(`Birthday email cron failed: ${error}`);
    }
  }

  /**
   * Daily digest cron job.
   * Runs at 8:00 AM Toronto time (Eastern), every day.
   * Cron: second(0) minute(0) hour(8) dayOfMonth(*) month(*) dayOfWeek(*)
   */
  @Cron('0 0 8 * * *', { timeZone: 'America/Toronto' })
  async handleDailyDigest(): Promise<void> {
    this.logger.log('Daily digest cron triggered');
    try {
      await this.notificationsService.sendDailyDigestForAllTenants();
      this.logger.log('Daily digest cron completed successfully');
    } catch (error) {
      this.logger.error(`Daily digest cron failed: ${error}`);
    }
  }
}
