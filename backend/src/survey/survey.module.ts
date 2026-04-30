import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from './survey.entity';
import { Question } from './question.entity';
import { Option } from './option.entity';
import { Answer } from './answer.entity';
import { Response } from './response.entity';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Survey, Question, Option, Answer, Response])],
  providers: [SurveyService],
  controllers: [SurveyController],
  exports: [SurveyService],
}) export class SurveyModule {}