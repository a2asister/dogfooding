import { Controller, Get, Post, Delete, Body, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ViewHistoryService } from './view-history.service';
import { ViewHistory } from '../entities/view-history.entity';

@Controller('view-history')
export class ViewHistoryController {
  constructor(private readonly viewHistoryService: ViewHistoryService) {}

  @Get()
  findAll(@Query('limit') limit?: string): Promise<ViewHistory[]> {
    return this.viewHistoryService.findAll(limit ? +limit : 10);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  add(
    @Body() historyData: { photoId: number; photoUrl: string; photoTitle: string },
  ): Promise<ViewHistory> {
    return this.viewHistoryService.add(historyData);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clear(): Promise<void> {
    return this.viewHistoryService.clear();
  }
}
