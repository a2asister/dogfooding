import { IsNumber, IsString } from 'class-validator';

export class CreateMeasurementDto {
  @IsNumber()
  value: number;

  @IsString()
  unit: string;

  @IsString()
  label: string;
}
