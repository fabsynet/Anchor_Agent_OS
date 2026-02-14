import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { TenantId } from '../auth/decorators/tenant-id.decorator.js';
import { UpdateTenantDto } from './dto/update-tenant.dto.js';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * GET /api/tenants/current
   * Returns the current user's tenant.
   */
  @Get('current')
  async getCurrent(@TenantId() tenantId: string) {
    return this.tenantsService.findById(tenantId);
  }

  /**
   * PATCH /api/tenants/current
   * Updates the current tenant's details. Admin only.
   */
  @Patch('current')
  @Roles('admin')
  async updateCurrent(
    @TenantId() tenantId: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.updateTenant(tenantId, dto);
  }
}
