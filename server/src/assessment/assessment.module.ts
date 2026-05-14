import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { Assessment } from '../entity/assessment.entity';
import { Answer } from '../entity/answer.entity';
import { UserPreference } from '../entity/user-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assessment, Answer, UserPreference])],
  controllers: [AssessmentController],
  providers: [AssessmentService],
})
export class AssessmentModule {}
