import { IsNumber, IsString } from 'class-validator';

export class CreateScaleParamsDto {
  @IsString()
  name: string;

  @IsString()
  unit: string;

  @IsNumber()
  pixelsPerUnit: number;
}
