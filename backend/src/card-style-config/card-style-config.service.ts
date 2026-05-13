import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardStyleConfig } from './card-style-config.entity';

@Injectable()
export class CardStyleConfigService {
  constructor(
    @InjectRepository(CardStyleConfig)
    private configRepository: Repository<CardStyleConfig>,
  ) {}

  async findByUserId(userId: number): Promise<CardStyleConfig | null> {
    return this.configRepository.findOne({ where: { userId } });
  }

  async createOrUpdate(userId: number, configData: Partial<CardStyleConfig>): Promise<CardStyleConfig> {
    let config = await this.findByUserId(userId);
    if (config) {
      await this.configRepository.update(config.id, configData);
      return (await this.findByUserId(userId))!;
    } else {
      config = this.configRepository.create({ ...configData, userId });
      return this.configRepository.save(config);
    }
  }
}