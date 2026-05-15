import { IsString, IsArray, IsBoolean, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../survey.entity';

class QuestionDto {
  @IsString()
  id: string = '';

  @IsEnum(QuestionType)
  type: QuestionType = QuestionType.TEXT;

  @IsString()
  title: string = '';

  @IsBoolean()
  required: boolean = false;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  minRating?: number;

  @IsOptional()
  maxRating?: number;
}

export class CreateSurveyDto {
  @IsString()
  title: string = '';

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[] = [];

  @IsOptional()
  @IsBoolean()
  requireAuth?: boolean;
}

export class UpdateSurveyDto extends CreateSurveyDto {
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
