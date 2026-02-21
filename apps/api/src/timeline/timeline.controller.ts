import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TimelineService } from './timeline.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { TenantId } from '../auth/decorators/tenant-id.decorator.js';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard.js';
import { CreateNoteDto } from './dto/create-note.dto.js';

@Controller('clients/:clientId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  /**
   * GET /api/clients/:clientId/timeline
   * Get the chronological activity timeline for a client.
   */
  @Get('timeline')
  async getTimeline(
    @TenantId() tenantId: string,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.timelineService.getTimeline(
      tenantId,
      clientId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * POST /api/clients/:clientId/notes
   * Create an immutable note for a client.
   */
  @Post('notes')
  async createNote(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.timelineService.createNote(
      tenantId,
      clientId,
      user.id,
      dto.content,
    );
  }
}
