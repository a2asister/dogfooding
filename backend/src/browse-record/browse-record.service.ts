import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrowseRecord } from '../entities/browse-record.entity';

@Injectable()
export class BrowseRecordService {
  constructor(
    @InjectRepository(BrowseRecord)
    private browseRecordRepository: Repository<BrowseRecord>,
  ) {}

  async findAll(): Promise<BrowseRecord[]> {
    return this.browseRecordRepository.find();
  }

  async create(houseId: number, ipAddress: string, userId?: string): Promise<BrowseRecord> {
    const record = this.browseRecordRepository.create({ houseId, ipAddress, userId });
    return this.browseRecordRepository.save(record);
  }

  async getStats(houseId?: number): Promise<{ total: number; houseId?: number }[]> {
    const query = this.browseRecordRepository
      .createQueryBuilder('record')
      .select('COUNT(*)', 'total');
    
    if (houseId) {
      query.where('record.houseId = :houseId', { houseId })
           .addSelect('record.houseId', 'houseId');
    } else {
      query.addSelect('record.houseId', 'houseId')
           .groupBy('record.houseId');
    }
    
    return query.getRawMany();
  }
}
