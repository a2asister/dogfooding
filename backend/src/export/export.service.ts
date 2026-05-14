import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportRecord } from '../entity/ExportRecord';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(ExportRecord)
    private exportRepository: Repository<ExportRecord>,
  ) {}

  findAll(): Promise<ExportRecord[]> {
    return this.exportRepository.find({ order: { createdAt: 'DESC' } });
  }

  create(record: { filename: string; colors: string[] }): Promise<ExportRecord> {
    const newRecord = this.exportRepository.create(record);
    return this.exportRepository.save(newRecord);
  }
}
