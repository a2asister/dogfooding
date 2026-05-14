import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Work } from './work.entity';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class WorkService {
  constructor(
    @InjectRepository(Work)
    private workRepository: Repository<Work>,
  ) {}

  async create(data: { title: string; imageData: string; params: any }) {
    const base64Data = data.imageData.replace(/^data:image\/png;base64,/, '');
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
    const filePath = join(__dirname, '../../uploads', filename);
    
    fs.writeFileSync(filePath, base64Data, 'base64');
    
    const work = new Work();
    work.title = data.title;
    work.imageUrl = `/uploads/${filename}`;
    work.params = data.params;
    work.thumbnail = `/uploads/${filename}`;
    
    return this.workRepository.save(work);
  }

  async findAll(page = 1, limit = 20) {
    const [items, total] = await this.workRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findOne(id: number) {
    return this.workRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    return this.workRepository.delete(id);
  }
}
