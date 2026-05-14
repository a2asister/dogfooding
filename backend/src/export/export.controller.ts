import { Controller, Get, Post, Body } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportRecord } from '../entity/ExportRecord';

@Controller('api/exports')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  findAll(): Promise<ExportRecord[]> {
    return this.exportService.findAll();
  }

  @Post()
  create(@Body() record: { filename: string; colors: string[] }): Promise<ExportRecord> {
    return this.exportService.create(record);
  }
}
