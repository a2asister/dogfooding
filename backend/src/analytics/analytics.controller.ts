import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('survey/:surveyId')
  getSurveyAnalytics(@Param('surveyId') surveyId: string) {
    return this.analyticsService.getSurveyAnalytics(surveyId);
  }

  @Get('survey/:surveyId/export')
  async exportResponses(@Param('surveyId') surveyId: string, @Res() res: Response) {
    const data = await this.analyticsService.exportResponses(surveyId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="survey-${surveyId}-responses.json"`);
    res.json(data);
  }
}
