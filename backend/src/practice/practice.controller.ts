import { Controller, Get, Post, Body } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { PracticeRecord } from '../entities/practice-record.entity';
import { ErrorCharacter } from '../entities/error-character.entity';

@Controller('api/practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('record')
  async createRecord(@Body() record: Omit<PracticeRecord, 'id'>): Promise<PracticeRecord> {
    return this.practiceService.createRecord(record);
  }

  @Get('records')
  async getRecords(): Promise<PracticeRecord[]> {
    return this.practiceService.getRecords();
  }

  @Get('errors')
  async getErrorCharacters(): Promise<ErrorCharacter[]> {
    return this.practiceService.getErrorCharacters();
  }
}
