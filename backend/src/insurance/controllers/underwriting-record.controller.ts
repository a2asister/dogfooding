import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { UnderwritingRecordService } from '../services/underwriting-record.service';
import { UnderwritingRecord } from '../interfaces/insurance.interface';

@Controller('underwriting-records')
export class UnderwritingRecordController {
  constructor(private readonly underwritingRecordService: UnderwritingRecordService) {}

  @Get()
  findAll(@Query('applicationId') applicationId?: string): UnderwritingRecord[] {
    if (applicationId) {
      return this.underwritingRecordService.findByApplicationId(applicationId);
    }
    return this.underwritingRecordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): UnderwritingRecord {
    const record = this.underwritingRecordService.findOne(id);
    if (!record) {
      throw new HttpException('Underwriting record not found', HttpStatus.NOT_FOUND);
    }
    return record;
  }

  @Post()
  create(@Body() record: Omit<UnderwritingRecord, 'id' | 'createdAt' | 'updatedAt'>): UnderwritingRecord {
    return this.underwritingRecordService.create(record);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() record: Partial<UnderwritingRecord>): UnderwritingRecord {
    const updatedRecord = this.underwritingRecordService.update(id, record);
    if (!updatedRecord) {
      throw new HttpException('Underwriting record not found', HttpStatus.NOT_FOUND);
    }
    return updatedRecord;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    const success = this.underwritingRecordService.remove(id);
    if (!success) {
      throw new HttpException('Underwriting record not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }
}
