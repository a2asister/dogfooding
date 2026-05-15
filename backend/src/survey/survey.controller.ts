import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto, UpdateSurveyDto } from './dto/create-survey.dto';

@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  create(@Body() createSurveyDto: CreateSurveyDto) {
    return this.surveyService.create(createSurveyDto);
  }

  @Get()
  findAll() {
    return this.surveyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surveyService.findOne(id);
  }

  @Get(':id/published')
  findPublished(@Param('id') id: string) {
    return this.surveyService.findPublished(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSurveyDto: UpdateSurveyDto) {
    return this.surveyService.update(id, updateSurveyDto);
  }

  @Put(':id/publish')
  publish(@Param('id') id: string) {
    return this.surveyService.publish(id);
  }

  @Put(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.surveyService.unpublish(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.surveyService.remove(id);
  }
}
