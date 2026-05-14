import { Controller, Post, Get, Delete, Param, Body, Query } from '@nestjs/common';
import { WorkService } from './work.service';

@Controller('work')
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  @Post()
  async create(@Body() body: { title: string; imageData: string; params: any }) {
    return this.workService.create(body);
  }

  @Get()
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.workService.findAll(+page || 1, +limit || 20);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workService.findOne(+id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.workService.delete(+id);
  }
}
