import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';

const POLICY_TYPES = [
  'auto',
  'home',
  'life',
  'health',
  'commercial',
  'travel',
  'umbrella',
  'other',
] as const;

const POLICY_STATUSES = [
  'draft',
  'active',
  'pending_renewal',
  'renewed',
  'expired',
  'cancelled',
] as const;

const PAYMENT_FREQUENCIES = [
  'monthly',
  'quarterly',
  'semi_annual',
  'annual',
] as const;

export class CreatePolicyDto {
  @IsEnum(POLICY_TYPES, {
    message: `Type must be one of: ${POLICY_TYPES.join(', ')}`,
  })
  type!: (typeof POLICY_TYPES)[number];

  @IsOptional()
  @IsString()
  customType?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  /** Decimal as string, e.g. "1250.00" */
  @IsOptional()
  @IsString()
  premium?: string;

  /** Decimal as string */
  @IsOptional()
  @IsString()
  coverageAmount?: string;

  /** Decimal as string */
  @IsOptional()
  @IsString()
  deductible?: string;

  @IsOptional()
  @IsEnum(PAYMENT_FREQUENCIES, {
    message: `Payment frequency must be one of: ${PAYMENT_FREQUENCIES.join(', ')}`,
  })
  paymentFrequency?: (typeof PAYMENT_FREQUENCIES)[number];

  /** Decimal as string, percentage e.g. "15.00" */
  @IsOptional()
  @IsString()
  brokerCommission?: string;

  @IsOptional()
  @IsEnum(POLICY_STATUSES, {
    message: `Status must be one of: ${POLICY_STATUSES.join(', ')}`,
  })
  status?: (typeof POLICY_STATUSES)[number];

  @IsOptional()
  @IsString()
  notes?: string;
}
