import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewHistory } from '../entities/view-history.entity';

@Injectable()
export class ViewHistoryService {
  constructor(
    @InjectRepository(ViewHistory)
    private viewHistoryRepository: Repository<ViewHistory>,
  ) {}

  async findAll(limit = 10): Promise<ViewHistory[]> {
    return this.viewHistoryRepository.find({
      order: { viewedAt: 'DESC' },
      take: limit,
    });
  }

  async add(historyData: { photoId: number; photoUrl: string; photoTitle: string }): Promise<ViewHistory> {
    const existing = await this.viewHistoryRepository.findOne({
      where: { photoId: historyData.photoId },
    });
    
    if (existing) {
      existing.viewedAt = new Date();
      return this.viewHistoryRepository.save(existing);
    }
    
    const history = this.viewHistoryRepository.create(historyData);
    return this.viewHistoryRepository.save(history);
  }

  async clear(): Promise<void> {
    await this.viewHistoryRepository.clear();
  }
}
