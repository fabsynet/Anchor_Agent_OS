import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service.js';
import { ClientsController } from './clients.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { TimelineModule } from '../timeline/timeline.module.js';

@Module({
  imports: [AuthModule, TimelineModule],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
