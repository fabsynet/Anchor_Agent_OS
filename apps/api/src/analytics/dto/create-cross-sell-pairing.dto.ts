import { IsString, IsArray, ArrayMinSize, IsNotEmpty } from 'class-validator';

export class CreateCrossSellPairingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  types: string[];
}
