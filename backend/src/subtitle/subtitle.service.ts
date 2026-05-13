import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subtitle } from './subtitle.entity';

@Injectable()
export class SubtitleService {
  constructor(
    @InjectRepository(Subtitle)
    private readonly subtitleRepository: Repository<Subtitle>,
  ) {}

  async findByProjectId(projectId: string): Promise<Subtitle[]> {
    return this.subtitleRepository.find({
      where: { projectId },
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Subtitle> {
    const subtitle = await this.subtitleRepository.findOne({ where: { id } });
    if (!subtitle) {
      throw new NotFoundException(`Subtitle with ID ${id} not found`);
    }
    return subtitle;
  }

  async create(createData: {
    projectId: string;
    text: string;
    startTime: number;
    endTime: number;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    animationType?: string;
  }): Promise<Subtitle> {
    const subtitle = this.subtitleRepository.create(createData);
    return this.subtitleRepository.save(subtitle);
  }

  async update(id: string, updateData: Partial<Subtitle>): Promise<Subtitle> {
    await this.subtitleRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.subtitleRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
