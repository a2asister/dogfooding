import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './config.entity';
import { CreateConfigInput, UpdateConfigInput } from './config.dto';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) {}

  async findAll(): Promise<Config[]> {
    return this.configRepository.find();
  }

  async findOne(id: string): Promise<Config> {
    const config = await this.configRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException(`Config with ID ${id} not found`);
    }
    return config;
  }

  async findByGroup(group: string): Promise<Config[]> {
    return this.configRepository.find({ where: { group } });
  }

  async create(input: CreateConfigInput): Promise<Config> {
    const config = this.configRepository.create(input);
    return this.configRepository.save(config);
  }

  async update(id: string, input: UpdateConfigInput): Promise<Config> {
    const config = await this.findOne(id);
    Object.assign(config, input);
    return this.configRepository.save(config);
  }

  async remove(id: string): Promise<boolean> {
    const config = await this.findOne(id);
    await this.configRepository.remove(config);
    return true;
  }

  async exportAll(): Promise<string> {
    const configs = await this.findAll();
    return JSON.stringify(configs, null, 2);
  }

  async importAll(jsonString: string): Promise<Config[]> {
    const configs = JSON.parse(jsonString);
    const results: Config[] = [];
    for (const config of configs) {
      delete config.id;
      delete config.createdAt;
      delete config.updatedAt;
      const newConfig = await this.create(config);
      results.push(newConfig);
    }
    return results;
  }
}
