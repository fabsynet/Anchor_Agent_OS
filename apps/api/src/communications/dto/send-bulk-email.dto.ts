import { IsString, IsNotEmpty, MaxLength, IsIn, IsOptional } from 'class-validator';

export class SendBulkEmailDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  body: string;

  @IsOptional()
  @IsIn(['all', 'clients_only', 'leads_only'])
  recipientFilter?: 'all' | 'clients_only' | 'leads_only' = 'all';
}
