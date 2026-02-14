import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service.js';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a tenant by ID.
   */
  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${id} not found`);
    }

    return tenant;
  }

  /**
   * Update tenant details (name, phone, address, province).
   * Used by the setup wizard and settings page.
   */
  async updateTenant(
    id: string,
    data: {
      name?: string;
      phone?: string;
      address?: string;
      province?: string;
    },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${id} not found`);
    }

    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }
}
