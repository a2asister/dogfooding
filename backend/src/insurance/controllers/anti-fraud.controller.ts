import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { AntiFraudService } from '../services/anti-fraud.service';
import { AntiFraudRecord } from '../interfaces/insurance.interface';

@Controller('anti-fraud-records')
export class AntiFraudController {
  constructor(private readonly antiFraudService: AntiFraudService) {}

  @Get()
  findAll(@Query('relatedId') relatedId?: string): AntiFraudRecord[] {
    if (relatedId) {
      return this.antiFraudService.findByRelatedId(relatedId);
    }
    return this.antiFraudService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): AntiFraudRecord {
    const record = this.antiFraudService.findOne(id);
    if (!record) {
      throw new HttpException('Anti-fraud record not found', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  @Post()
  create(@Body() record: Omit<AntiFraudRecord, 'id' | 'createdAt' | 'updatedAt'>): AntiFraudRecord {
    return this.antiFraudService.create(record);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() record: Partial<AntiFraudRecord>): AntiFraudRecord {
    const updatedRecord = this.antiFraudService.update(id, record);
    if (!updatedRecord) {
      throw new HttpException('Anti-fraud record not found', HttpStatus.NOT_FOUND);
    }
    return updatedRecord;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    const success = this.antiFraudService.remove(id);
    if (!success) {
      throw new HttpException('Anti-fraud record not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }
}
