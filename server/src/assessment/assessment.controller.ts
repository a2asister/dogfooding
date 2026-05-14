import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { AssessmentService } from './assessment.service';

@Controller('api/assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  async saveAssessment(@Body() body: { userId: string; answers: any[]; result: any }) {
    return this.assessmentService.saveAssessment(body.userId, body.answers, body.result);
  }

  @Get('history')
  async getHistory(@Query('userId') userId: string) {
    return this.assessmentService.getHistory(userId);
  }

  @Get('tag-stats')
  async getTagStats(@Query('userId') userId: string) {
    return this.assessmentService.getTagStats(userId);
  }
}
