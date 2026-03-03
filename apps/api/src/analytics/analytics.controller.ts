import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { TenantId } from '../auth/decorators/tenant-id.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { AnalyticsQueryDto } from './dto/analytics-query.dto.js';
import { CreateCrossSellPairingDto } from './dto/create-cross-sell-pairing.dto.js';
import { CreateCrossSellCampaignDto } from './dto/create-cross-sell-campaign.dto.js';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /api/analytics/overview
   * Overview stats: total clients, active policies, premium YTD, renewal rate.
   */
  @Get('overview')
  async getOverview(
    @TenantId() tenantId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getOverview(
      tenantId,
      query.startDate,
      query.endDate,
    );
  }

  /**
   * GET /api/analytics/policy-breakdown
   * Policy type breakdown with counts and premium sums.
   */
  @Get('policy-breakdown')
  async getPolicyBreakdown(
    @TenantId() tenantId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getPolicyBreakdown(
      tenantId,
      query.startDate,
      query.endDate,
    );
  }

  /**
   * GET /api/analytics/client-stats
   * Client statistics: total, active, leads, new this period.
   */
  @Get('client-stats')
  async getClientStats(
    @TenantId() tenantId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getClientStats(
      tenantId,
      query.startDate,
      query.endDate,
    );
  }

  /**
   * GET /api/analytics/renewal-pipeline
   * Renewal pipeline: monthly active/expiring/expired counts.
   */
  @Get('renewal-pipeline')
  async getRenewalPipeline(@TenantId() tenantId: string) {
    return this.analyticsService.getRenewalPipeline(tenantId);
  }

  /**
   * GET /api/analytics/expense-summary
   * Expense summary: approved, pending, by category, budget usage.
   */
  @Get('expense-summary')
  async getExpenseSummary(
    @TenantId() tenantId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getExpenseSummary(
      tenantId,
      query.startDate,
      query.endDate,
    );
  }

  /**
   * GET /api/analytics/compliance-summary
   * Compliance summary: total events, by type, by user.
   */
  @Get('compliance-summary')
  async getComplianceSummary(
    @TenantId() tenantId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getComplianceSummary(
      tenantId,
      query.startDate,
      query.endDate,
    );
  }

  /**
   * GET /api/analytics/cross-sell
   * Cross-sell opportunities: clients with coverage gaps.
   */
  @Get('cross-sell')
  async getCrossSellOpportunities(@TenantId() tenantId: string) {
    return this.analyticsService.getCrossSellOpportunities(tenantId);
  }

  /**
   * GET /api/analytics/premium-by-product
   * Premium by product line with customType breakdown for 'other'.
   */
  @Get('premium-by-product')
  async getPremiumByProductLine(
    @TenantId() tenantId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getPremiumByProductLine(
      tenantId,
      query.startDate,
      query.endDate,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Cross-Sell Pairings (admin-only)
  // ──────────────────────────────────────────────────────────────────────────

  @Get('cross-sell/pairings')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCrossSellPairings(@TenantId() tenantId: string) {
    return this.analyticsService.getCrossSellPairings(tenantId);
  }

  @Post('cross-sell/pairings')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createCrossSellPairing(
    @TenantId() tenantId: string,
    @Body() dto: CreateCrossSellPairingDto,
  ) {
    try {
      return await this.analyticsService.createCrossSellPairing(tenantId, dto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create pairing',
      );
    }
  }

  @Delete('cross-sell/pairings/:id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteCrossSellPairing(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.analyticsService.deleteCrossSellPairing(tenantId, id);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Cross-Sell Campaigns (admin-only)
  // ──────────────────────────────────────────────────────────────────────────

  @Get('cross-sell/campaigns')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCrossSellCampaigns(@TenantId() tenantId: string) {
    return this.analyticsService.getCrossSellCampaigns(tenantId);
  }

  @Post('cross-sell/campaigns')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createCrossSellCampaign(
    @TenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCrossSellCampaignDto,
  ) {
    return this.analyticsService.createCrossSellCampaign(
      tenantId,
      userId,
      dto,
    );
  }

  @Patch('cross-sell/campaigns/:id/stop')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async stopCrossSellCampaign(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.analyticsService.stopCrossSellCampaign(tenantId, id);
  }

  @Get('cross-sell/campaigns/:id/emails')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCampaignEmailedClients(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.analyticsService.getCampaignEmailedClients(tenantId, id);
  }
}
