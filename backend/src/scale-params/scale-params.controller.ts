import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScaleParamsService } from './scale-params.service';
import { CreateScaleParamsDto } from './dto/create-scale-params.dto';
import { ScaleParams } from './scale-params.entity';

@Controller('scale-params')
export class ScaleParamsController {
  constructor(private readonly scaleParamsService: ScaleParamsService) {}

  @Get()
  findAll(): Promise<ScaleParams[]> {
    return this.scaleParamsService.findAll();
  }

  @Post()
  create(@Body() createScaleParamsDto: CreateScaleParamsDto): Promise<ScaleParams> {
    return this.scaleParamsService.create(createScaleParamsDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<ScaleParams>): Promise<ScaleParams> {
    return this.scaleParamsService.update(Number(id), updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.scaleParamsService.remove(Number(id));
  }
}
