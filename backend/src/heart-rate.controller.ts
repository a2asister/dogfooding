import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HeartRate } from './heart-rate.entity';

@Controller('heart-rate')
export class HeartRateController {
  constructor(
    @InjectRepository(HeartRate)
    private heartRateRepository: Repository<HeartRate>,
  ) {}

  @Get('history')
  async getHistory(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const where = start && end
      ? { timestamp: Between(new Date(start), new Date(end)) }
      : {};

    const data = await this.heartRateRepository.find({
      where,
      order: { timestamp: 'DESC' },
      take: 100,
    });

    return {
      data,
      count: data.length,
    };
  }

  @Get('latest')
  async getLatest() {
    return await this.heartRateRepository.findOne({
      order: { timestamp: 'DESC' },
    });
  }

  @Get('stats')
  async getStats() {
    const data = await this.heartRateRepository.find({
      order: { timestamp: 'DESC' },
      take: 100,
    });

    if (data.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const rates = data.map(d => d.rate);
    return {
      avg: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length),
      min: Math.min(...rates),
      max: Math.max(...rates),
      count: data.length,
    };
  }
}
