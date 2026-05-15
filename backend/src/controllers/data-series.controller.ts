import { Controller, Get, Post, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DataSeriesService, CreateSeriesDto } from '../services/data-series.service';
import { ReportService } from '../services/report.service';

@Controller('api/series')
export class DataSeriesController {
  constructor(
    private readonly dataSeriesService: DataSeriesService,
    private readonly reportService: ReportService,
  ) {}

  @Get()
  async findAll() {
    const series = await this.dataSeriesService.findAll();
    return { success: true, data: series };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const series = await this.dataSeriesService.findOne(id);
    return { success: true, data: series };
  }

  @Get(':id/trend')
  async getTrendAnalysis(@Param('id') id: string) {
    const trend = await this.dataSeriesService.getTrendAnalysis(id);
    return { success: true, data: trend };
  }

  @Post()
  async create(@Body() dto: CreateSeriesDto) {
    const series = await this.dataSeriesService.create(dto);
    return { success: true, data: series };
  }

  @Put(':id/recalculate')
  async recalculate(@Param('id') id: string, @Body() dto: Partial<CreateSeriesDto>) {
    const series = await this.dataSeriesService.recalculate(id, dto);
    return { success: true, data: series };
  }

  @Post('compare')
  async compareSeries(@Body() body: { ids: string[] }) {
    const result = await this.dataSeriesService.compareSeries(body.ids);
    return { success: true, data: result };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.dataSeriesService.delete(id);
    return { success: true };
  }

  @Get(':id/export/excel')
  async exportExcel(@Param('id') id: string, @Res() res: Response) {
    const series = await this.dataSeriesService.findOne(id);
    const buffer = await this.reportService.generateExcelReport([series]);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${series.name}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get(':id/export/pdf')
  async exportPDF(@Param('id') id: string, @Res() res: Response) {
    const series = await this.dataSeriesService.findOne(id);
    const buffer = await this.reportService.generatePDFReport([series]);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${series.name}.pdf"`,
    });
    res.send(buffer);
  }
}
