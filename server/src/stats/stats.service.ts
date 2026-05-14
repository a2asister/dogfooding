import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from '../upload/upload.entity';
import { Work } from '../work/work.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
    @InjectRepository(Work)
    private workRepository: Repository<Work>,
  ) {}

  async getStats() {
    const uploadCount = await this.uploadRepository.count();
    const workCount = await this.workRepository.count();
    
    const recentUploads = await this.uploadRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });
    
    const recentWorks = await this.workRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });
    
    const totalUploadSize = await this.uploadRepository
      .createQueryBuilder('upload')
      .select('SUM(upload.size)', 'total')
      .getRawOne();
    
    return {
      uploadCount,
      workCount,
      totalUploadSize: totalUploadSize.total || 0,
      recentUploads,
      recentWorks,
    };
  }
}
