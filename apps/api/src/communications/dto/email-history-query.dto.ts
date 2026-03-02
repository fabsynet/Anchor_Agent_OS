import { IsOptional, IsString, IsInt, Min, Max, IsUUID, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class EmailHistoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsIn(['birthday_greeting', 'renewal_reminder', 'bulk_announcement', 'digest'])
  type?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;
}
