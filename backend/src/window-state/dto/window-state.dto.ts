import { IsString, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';

export class CreateWindowStateDto {
  @IsString()
  windowId!: string;

  @IsString()
  title!: string;

  @IsString()
  type!: 'explorer' | 'editor' | 'calculator' | 'browser' | 'settings';

  @IsOptional()
  @IsNumber()
  x?: number;

  @IsOptional()
  @IsNumber()
  y?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsBoolean()
  isMinimized?: boolean;

  @IsOptional()
  @IsBoolean()
  isMaximized?: boolean;

  @IsOptional()
  @IsNumber()
  zIndex?: number;

  @IsOptional()
  @IsObject()
  data?: any;
}

export class UpdateWindowStateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  x?: number;

  @IsOptional()
  @IsNumber()
  y?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsBoolean()
  isMinimized?: boolean;

  @IsOptional()
  @IsBoolean()
  isMaximized?: boolean;

  @IsOptional()
  @IsNumber()
  zIndex?: number;

  @IsOptional()
  @IsObject()
  data?: any;
}
