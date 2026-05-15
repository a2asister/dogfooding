import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsBoolean } from 'class-validator';

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

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}

export class MoveFileDto {
  @IsOptional()
  @IsNumber()
  targetParentId?: number;
}

export class CopyFileDto {
  @IsOptional()
  @IsNumber()
  targetParentId?: number;
}

export class BatchOperationDto {
  @IsArray()
  fileIds!: number[];

  @IsString()
  operation!: 'delete' | 'move' | 'copy' | 'restore';

  @IsOptional()
  @IsNumber()
  targetParentId?: number;
}

export enum SortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TYPE = 'type',
  SIZE = 'size',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SortFilesDto {
  @IsEnum(SortField)
  field!: SortField;

  @IsEnum(SortOrder)
  order!: SortOrder;
}

export class FilePathDto {
  @IsString()
  path!: string;
}

export class RestoreFileDto {
  @IsOptional()
  @IsNumber()
  targetParentId?: number;
}