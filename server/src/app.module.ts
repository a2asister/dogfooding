import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentModule } from './assessment/assessment.module';
import { Assessment } from './entity/assessment.entity';
import { Answer } from './entity/answer.entity';
import { UserPreference } from './entity/user-preference.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'emotion-assessment.db',
      entities: [Assessment, Answer, UserPreference],
      synchronize: true,
    }),
    AssessmentModule,
  ],
})
export class AppModule {}
