import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedWork } from './entities/saved-work.entity';
import { Template } from './entities/template.entity';
import { CreationRecord } from './entities/creation-record.entity';
import type { FissionConfig } from './types/geometric';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(SavedWork)
    private readonly savedWorkRepository: Repository<SavedWork>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    @InjectRepository(CreationRecord)
    private readonly creationRecordRepository: Repository<CreationRecord>,
  ) {}

  async saveWork(name: string, config: FissionConfig, thumbnail: string): Promise<SavedWork> {
    const work = this.savedWorkRepository.create({ name, config, thumbnail });
    const savedWork = await this.savedWorkRepository.save(work);
    await this.addCreationRecord(savedWork.id, 'create');
    return savedWork;
  }

  async getWorks(): Promise<SavedWork[]> {
    return this.savedWorkRepository.find({ order: { createdAt: 'DESC' } });
  }

  async deleteWork(id: number): Promise<void> {
    await this.savedWorkRepository.delete(id);
    await this.addCreationRecord(id, 'delete');
  }

  async saveTemplate(
    name: string,
    config: FissionConfig,
    thumbnail: string,
    category: string,
  ): Promise<Template> {
    const template = this.templateRepository.create({ name, config, thumbnail, category });
    return this.templateRepository.save(template);
  }

  async getTemplates(): Promise<Template[]> {
    return this.templateRepository.find({ order: { createdAt: 'DESC' } });
  }

  async addCreationRecord(workId: number, action: string): Promise<CreationRecord> {
    const record = this.creationRecordRepository.create({ workId, action });
    return this.creationRecordRepository.save(record);
  }

  async getCreationRecords(): Promise<CreationRecord[]> {
    return this.creationRecordRepository.find({ order: { createdAt: 'DESC' } });
  }
}
