import {
  IsString,
  MinLength,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDateString,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator: if status is 'lead', at least email or phone must be provided.
 */
@ValidatorConstraint({ name: 'leadContactRequired', async: false })
class LeadContactRequired implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments) {
    const obj = args.object as CreateClientDto;
    if (obj.status === 'lead') {
      return !!(obj.email || obj.phone);
    }
    return true;
  }

  defaultMessage() {
    return 'Leads must have at least an email or phone number';
  }
}

export class CreateClientDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Validate(LeadContactRequired)
  phone?: string;

  @IsEnum(['lead', 'client'], { message: 'Status must be lead or client' })
  status!: 'lead' | 'client';

  /** Address fields required when status is 'client' */
  @ValidateIf((o) => o.status === 'client')
  @IsString()
  address?: string;

  @ValidateIf((o) => o.status === 'client')
  @IsString()
  city?: string;

  @ValidateIf((o) => o.status === 'client')
  @IsString()
  province?: string;

  @ValidateIf((o) => o.status === 'client')
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
