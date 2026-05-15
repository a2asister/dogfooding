import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ResponseModule } from '../response/response.module';
import { SurveyModule } from '../survey/survey.module';

@Module({
  imports: [ResponseModule, SurveyModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
