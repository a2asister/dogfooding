import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryEntity } from '../entities/history.entity';

export interface HistoryRecord {
  id: string;
  pathId: string;
  action: string;
  beforeData: any;
  afterData: any;
  timestamp: number;
}

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(HistoryEntity)
    private historyRepository: Repository<HistoryEntity>,
  ) {}

  async getByPathId(pathId: string): Promise<HistoryRecord[]> {
    return this.historyRepository.find({
      where: { pathId },
      order: { timestamp: 'DESC' },
    });
  }

  async create(record: Omit<HistoryRecord, 'id' | 'timestamp'>): Promise<HistoryRecord> {
    const id = Math.random().toString(36).substring(2, 11);
    const entity = this.historyRepository.create({
      id,
      ...record,
      timestamp: Date.now(),
    });
    return this.historyRepository.save(entity);
  }
}