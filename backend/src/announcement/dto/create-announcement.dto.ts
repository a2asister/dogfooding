import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDateString,
  MinLength,
} from 'class-validator';
import { AnnouncementStatus, AnnouncementPriority } from '../announcement.entity';

export class CreateAnnouncementDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;

  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsDateString()
  expireAt?: string;

  @IsOptional()
  @IsString()
  publishedBy?: string;
}
