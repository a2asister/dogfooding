import { Controller, Get, Post, Body, Param, Query, Put } from '@nestjs/common';
import { ResponseService } from './response.service';
import { CreateResponseDto } from './dto/create-response.dto';

@Controller('responses')
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  @Post()
  create(@Body() createResponseDto: CreateResponseDto) {
    return this.responseService.create(createResponseDto);
  }

  @Get('survey/:surveyId')
  findBySurvey(
    @Param('surveyId') surveyId: string,
    @Query('includeInvalid') includeInvalid?: string,
  ) {
    return this.responseService.findBySurvey(surveyId, includeInvalid === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.responseService.findOne(id);
  }

  @Put(':id/invalid')
  markInvalid(@Param('id') id: string, @Body('reason') reason: string) {
    return this.responseService.markInvalid(id, reason);
  }
}
