import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { MeasurementService } from './measurement.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Measurement } from './measurement.entity';

@Controller('measurements')
export class MeasurementController {
  constructor(private readonly measurementService: MeasurementService) {}

  @Get()
  findAll(): Promise<Measurement[]> {
    return this.measurementService.findAll();
  }

  @Post()
  create(@Body() createMeasurementDto: CreateMeasurementDto): Promise<Measurement> {
    return this.measurementService.create(createMeasurementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.measurementService.remove(Number(id));
  }
}
