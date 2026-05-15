import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateAppDataDto {
  @IsString()
  appType!: 'notepad' | 'calculator' | 'browser';

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsString()
  title?: string;
}

export class UpdateAppDataDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsString()
  title?: string;
}
