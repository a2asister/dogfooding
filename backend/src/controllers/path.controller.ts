import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PathService, PathData } from '../services/path.service';

@Controller('paths')
export class PathController {
  constructor(private readonly pathService: PathService) {}

  @Get()
  findAll(): Promise<PathData[]> {
    return this.pathService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<PathData> {
    return this.pathService.findById(id);
  }

  @Post()
  create(@Body() data: Omit<PathData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PathData> {
    return this.pathService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<PathData>): Promise<PathData> {
    return this.pathService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.pathService.delete(id);
  }
}