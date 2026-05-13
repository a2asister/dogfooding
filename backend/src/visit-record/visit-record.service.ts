import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitRecord } from './visit-record.entity';

@Injectable()
export class VisitRecordService {
  constructor(
    @InjectRepository(VisitRecord)
    private visitRecordRepository: Repository<VisitRecord>,
  ) {}

  async recordVisit(userId: number, visitorIp?: string, userAgent?: string): Promise<VisitRecord> {
    const record = this.visitRecordRepository.create({ userId, visitorIp, userAgent });
    return this.visitRecordRepository.save(record);
  }

  async countByUserId(userId: number): Promise<number> {
    return this.visitRecordRepository.count({ where: { userId } });
  }

  async findByUserId(userId: number, limit: number = 50): Promise<VisitRecord[]> {
    return this.visitRecordRepository.find({
      where: { userId },
      order: { visitedAt: 'DESC' },
      take: limit,
    });
  }
}