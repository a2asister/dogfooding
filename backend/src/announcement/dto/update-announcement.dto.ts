import { PartialType } from '@nestjs/mapped-types';
import { CreateAnnouncementDto } from './create-announcement.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {
  @IsOptional()
  @IsString()
  userId?: string;
}

export class BatchUpdateDto {
  @IsArray()
  ids: number[];

  @IsOptional()
  status?: string;

  @IsOptional()
  isPinned?: boolean;
}

export class MarkReadDto {
  @IsString()
  userId: string;
}
