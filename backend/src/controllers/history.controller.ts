import { Controller, Get, Param } from '@nestjs/common';
import { HistoryService, HistoryRecord } from '../services/history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get(':pathId')
  getByPathId(@Param('pathId') pathId: string): Promise<HistoryRecord[]> {
    return this.historyService.getByPathId(pathId);
  }
}