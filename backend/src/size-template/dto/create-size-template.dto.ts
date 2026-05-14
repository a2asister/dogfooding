import { IsNumber, IsString } from 'class-validator';

export class CreateSizeTemplateDto {
  @IsString()
  name: string;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsString()
  unit: string;
}
