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
