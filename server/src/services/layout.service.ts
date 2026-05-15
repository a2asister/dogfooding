import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Layout } from '../entities/layout.entity';

@Injectable()
export class LayoutService {
  constructor(
    @InjectRepository(Layout)
    private layoutRepository: Repository<Layout>,
  ) {}

  async findAll(): Promise<Layout[]> {
    return this.layoutRepository.find();
  }

  async findOne(name: string): Promise<Layout> {
    return this.layoutRepository.findOne({ where: { name } });
  }

  async save(name: string, config: any): Promise<Layout> {
    let layout = await this.layoutRepository.findOne({ where: { name } });
    if (layout) {
      layout.config = config;
    } else {
      layout = this.layoutRepository.create({ name, config });
    }
    return this.layoutRepository.save(layout);
  }
}
