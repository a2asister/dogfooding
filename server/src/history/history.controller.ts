import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import type { CalculationHistory } from '../data/data.service';
import { DataService } from '../data/data.service';

@Controller('api/history')
export class HistoryController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  getHistory(): CalculationHistory[] {
    return this.dataService.getHistory();
  }

  @Post()
  addHistory(
    @Body() body: { expression: string; result: string },
  ): CalculationHistory {
    return this.dataService.addHistory({
      expression: body.expression,
      result: body.result,
    });
  }

  @Delete()
  clearHistory(): { success: boolean } {
    this.dataService.clearHistory();
    return { success: true };
  }

  @Delete(':id')
  deleteHistoryItem(@Param('id') id: string): { success: boolean } {
    const success = this.dataService.deleteHistoryItem(id);
    return { success };
  }
}
