import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsString()
  pageStructure!: string;

  @IsString()
  animationConfig!: string;

  @IsString()
  responsiveConfig!: string;

  @IsNumber()
  @IsOptional()
  scrollCalibration?: number;

  @IsBoolean()
  @IsOptional()
  isAutoSave?: boolean;
}
