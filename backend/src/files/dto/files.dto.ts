import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateFileDto {
  @IsString()
  name!: string;

  @IsString()
  type!: 'folder' | 'file';

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  content?: string;
}