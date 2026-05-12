import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './log.entity';
import { CreateLogInput } from './dto/create-log.input';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async findAll(): Promise<Log[]> {
    return this.logRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Log> {
    return this.logRepository.findOne({ where: { id } });
  }

  async create(createLogInput: CreateLogInput): Promise<Log> {
    const log = this.logRepository.create(createLogInput);
    return this.logRepository.save(log);
  }

  async remove(id: number): Promise<Log> {
    const log = await this.findOne(id);
    await this.logRepository.delete(id);
    return log;
  }

  async findByCategory(category: string): Promise<Log[]> {
    return this.logRepository.find({
      where: { category },
      order: { createdAt: 'DESC' },
    });
  }
}
