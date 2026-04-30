import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { Survey } from './survey.entity';
import { Response } from './response.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('surveys')
export class SurveyController {
  constructor(private surveyService: SurveyService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() survey: Partial<Survey>, @Request() req): Promise<Survey> {
    return this.surveyService.create({ ...survey, creator: { id: req.user.userId } as any });
  }

  @Get()
  async findAll(): Promise<Survey[]> {
    return this.surveyService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<Survey | undefined> {
    return this.surveyService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: number, @Body() survey: Partial<Survey>): Promise<Survey | undefined> {
    return this.surveyService.update(id, survey);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.surveyService.delete(id);
  }

  @Post(':id/responses')
  async submitResponse(@Param('id') id: number, @Body() response: Partial<Response>): Promise<Response> {
    return this.surveyService.submitResponse({ ...response, survey: { id } as any });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/responses')
  async getResponses(@Param('id') id: number): Promise<Response[]> {
    return this.surveyService.getResponses(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/statistics')
  async getSurveyStatistics(@Param('id') id: number): Promise<any> {
    return this.surveyService.getSurveyStatistics(id);
  }
}