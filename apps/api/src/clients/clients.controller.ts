import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ClientsService } from './clients.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { TenantId } from '../auth/decorators/tenant-id.decorator.js';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';
import { SearchClientsDto } from './dto/search-clients.dto.js';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * POST /api/clients
   * Create a new client or lead.
   */
  @Post()
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateClientDto,
  ) {
    return this.clientsService.create(tenantId, user.id, dto);
  }

  /**
   * GET /api/clients
   * List clients with search, status filter, and pagination.
   */
  @Get()
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: SearchClientsDto,
  ) {
    return this.clientsService.findAll(tenantId, query);
  }

  /**
   * GET /api/clients/:id
   * Get a single client with related data.
   */
  @Get(':id')
  async findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.clientsService.findOne(tenantId, id);
  }

  /**
   * PATCH /api/clients/:id
   * Update a client.
   */
  @Patch(':id')
  async update(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(tenantId, id, user.id, dto);
  }

  /**
   * DELETE /api/clients/:id
   * Delete a client (cascades to policies, events, notes).
   */
  @Delete(':id')
  async remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.clientsService.remove(tenantId, id);
  }

  /**
   * PATCH /api/clients/:id/convert
   * Toggle between lead and client status.
   */
  @Patch(':id/convert')
  async convert(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.clientsService.convert(tenantId, user.id, id);
  }
}
