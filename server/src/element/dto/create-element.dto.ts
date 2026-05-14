import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateElementDto {
  @IsNumber()
  @IsNotEmpty()
  atomicNumber!: number;

  @IsString()
  @IsNotEmpty()
  symbol!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsOptional()
  atomicMass?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  group?: number;

  @IsNumber()
  @IsOptional()
  period?: number;

  @IsString()
  @IsOptional()
  electronConfiguration?: string;

  @IsNumber()
  @IsOptional()
  electronegativity?: number;

  @IsNumber()
  @IsOptional()
  meltingPoint?: number;

  @IsNumber()
  @IsOptional()
  boilingPoint?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
