import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsString()
  questionId: string = '';

  value: string | string[] | number = '';
}

export class CreateResponseDto {
  @IsString()
  surveyId: string = '';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[] = [];

  @IsOptional()
  @IsString()
  respondentId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
