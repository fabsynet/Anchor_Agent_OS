import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { NotificationsScheduler } from './notifications.scheduler.js';

@Module({
  providers: [NotificationsService, NotificationsScheduler],
  exports: [NotificationsService],
})
export class NotificationsModule {}
