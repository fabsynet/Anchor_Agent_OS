import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { createSupabaseAdmin } from '../common/config/supabase.config.js';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Maximum number of invited users per agency (admin + 2 = 3 total) */
const INVITE_CAP = 2;

@Injectable()
export class InvitationsService {
  private readonly supabaseAdmin: SupabaseClient;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.supabaseAdmin = createSupabaseAdmin(configService);
    this.frontendUrl =
      configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  /**
   * Invite a user to the tenant.
   * Enforces invite cap of 2 users per agency.
   * Creates invitation record and calls Supabase inviteUserByEmail.
   */
  async inviteUser(
    tenantId: string,
    invitedById: string,
    email: string,
    role: 'admin' | 'agent',
  ) {
    // 1. Check invite cap: count pending + accepted invitations
    const inviteCount = await this.prisma.invitation.count({
      where: {
        tenantId,
        status: { in: ['pending', 'accepted'] },
      },
    });

    if (inviteCount >= INVITE_CAP) {
      throw new ForbiddenException(
        'Maximum invite limit reached (2 users)',
      );
    }

    // 2. Check for duplicate pending invite for same email
    const existingPending = await this.prisma.invitation.findFirst({
      where: {
        tenantId,
        email: email.toLowerCase(),
        status: 'pending',
      },
    });

    if (existingPending) {
      throw new BadRequestException(
        'An invitation is already pending for this email',
      );
    }

    // 3. Create invitation record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.create({
      data: {
        tenantId,
        email: email.toLowerCase(),
        role,
        invitedById,
        status: 'pending',
        expiresAt,
      },
    });

    // 4. Call Supabase inviteUserByEmail
    try {
      const { error } =
        await this.supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: {
            invitation_id: invitation.id,
            tenant_id: tenantId,
            role,
          },
          redirectTo: `${this.frontendUrl}/auth/callback?next=/accept-invite`,
        });

      if (error) {
        // 5. If Supabase call fails, delete the invitation record and rethrow
        await this.prisma.invitation.delete({
          where: { id: invitation.id },
        });
        throw new BadRequestException(
          `Failed to send invitation: ${error.message}`,
        );
      }
    } catch (err) {
      // If it's already a NestJS exception, rethrow as-is
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      // Unexpected error: clean up and rethrow
      await this.prisma.invitation.delete({
        where: { id: invitation.id },
      });
      throw new BadRequestException(
        'Failed to send invitation. Please try again.',
      );
    }

    return invitation;
  }

  /**
   * List all invitations for a tenant, ordered by newest first.
   */
  async listByTenant(tenantId: string) {
    return this.prisma.invitation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        invitedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Revoke a pending invitation.
   */
  async revokeInvitation(tenantId: string, invitationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, tenantId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(
        `Cannot revoke invitation with status "${invitation.status}"`,
      );
    }

    return this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'revoked' },
    });
  }

  /**
   * Resend an invitation (pending or expired).
   * Updates expiresAt to 7 days from now and re-sends via Supabase.
   */
  async resendInvitation(tenantId: string, invitationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, tenantId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (!['pending', 'expired'].includes(invitation.status)) {
      throw new BadRequestException(
        `Cannot resend invitation with status "${invitation.status}"`,
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Update expiry and set status back to pending
    const updated = await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { expiresAt, status: 'pending' },
    });

    // Re-send via Supabase
    const { error } =
      await this.supabaseAdmin.auth.admin.inviteUserByEmail(
        invitation.email,
        {
          data: {
            invitation_id: invitation.id,
            tenant_id: tenantId,
            role: invitation.role,
          },
          redirectTo: `${this.frontendUrl}/auth/callback?next=/accept-invite`,
        },
      );

    if (error) {
      throw new BadRequestException(
        `Failed to resend invitation: ${error.message}`,
      );
    }

    return updated;
  }

  /**
   * Accept a pending invitation by email.
   * Called by the database trigger or manually after user completes signup.
   */
  async acceptInvitation(email: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        email: email.toLowerCase(),
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!invitation) {
      return null;
    }

    const updated = await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' },
    });

    return updated;
  }
}
