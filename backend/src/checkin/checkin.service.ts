import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckinEntity } from '../entities/checkin.entity';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(CheckinEntity)
    private checkinRepository: Repository<CheckinEntity>,
  ) {}

  async findAll(): Promise<CheckinEntity[]> {
    return this.checkinRepository.find({
      order: { date: 'DESC' },
    });
  }

  async create(checkinData: Partial<CheckinEntity>): Promise<CheckinEntity> {
    const checkin = this.checkinRepository.create(checkinData);
    return this.checkinRepository.save(checkin);
  }
}
