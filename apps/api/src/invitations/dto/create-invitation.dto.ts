import { IsEmail, IsEnum } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email!: string;

  @IsEnum(['admin', 'agent'], { message: 'Role must be admin or agent' })
  role!: 'admin' | 'agent';
}


