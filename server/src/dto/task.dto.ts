import { IsString, IsNumber, IsOptional, IsBoolean, IsDate, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  progress?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  progress?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isCompleted?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isExpanded?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
