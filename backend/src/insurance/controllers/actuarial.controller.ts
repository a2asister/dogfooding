import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ActuarialService } from '../services/actuarial.service';
import { ActuarialData } from '../interfaces/insurance.interface';

@Controller('actuarial-data')
export class ActuarialController {
  constructor(private readonly actuarialService: ActuarialService) {}

  @Get()
  findAll(@Query('productId') productId?: string): ActuarialData[] {
    if (productId) {
      return this.actuarialService.findByProductId(productId);
    }
    return this.actuarialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): ActuarialData {
    const data = this.actuarialService.findOne(id);
    if (!data) {
      throw new HttpException('Actuarial data not found', HttpStatus.NOT_FOUND);
    }
    return data;
  }

  @Post()
  create(@Body() data: Omit<ActuarialData, 'id' | 'createdAt' | 'updatedAt'>): ActuarialData {
    return this.actuarialService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<ActuarialData>): ActuarialData {
    const updatedData = this.actuarialService.update(id, data);
    if (!updatedData) {
      throw new HttpException('Actuarial data not found', HttpStatus.NOT_FOUND);
    }
    return updatedData;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    const success = this.actuarialService.remove(id);
    if (!success) {
      throw new HttpException('Actuarial data not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }
}
