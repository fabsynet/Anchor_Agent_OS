import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEmailSettingsDto {
  @IsOptional()
  @IsBoolean()
  birthdayEmailsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  renewalReminder60Days?: boolean;

  @IsOptional()
  @IsBoolean()
  renewalReminder30Days?: boolean;

  @IsOptional()
  @IsBoolean()
  renewalReminder7Days?: boolean;
}
