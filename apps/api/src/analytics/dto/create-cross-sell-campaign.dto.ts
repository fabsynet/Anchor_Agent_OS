import { IsString, IsNotEmpty, IsBoolean, IsDateString } from 'class-validator';

export class CreateCrossSellCampaignDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsDateString()
  scheduledAt: string;

  @IsBoolean()
  recurring: boolean;
}
