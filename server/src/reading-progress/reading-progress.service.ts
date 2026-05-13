import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadingProgress } from './reading-progress.entity';
import { CreateReadingProgressInput } from './dto/create-reading-progress.input';
import { UpdateReadingProgressInput } from './dto/update-reading-progress.input';

@Injectable()
export class ReadingProgressService {
  constructor(
    @InjectRepository(ReadingProgress)
    private readonly readingProgressRepository: Repository<ReadingProgress>,
  ) {}

  async findAll(): Promise<ReadingProgress[]> {
    return this.readingProgressRepository.find({
      relations: ['book', 'user'],
    });
  }

  async findOne(id: string): Promise<ReadingProgress> {
    const progress = await this.readingProgressRepository.findOne({
      where: { id },
      relations: ['book', 'user'],
    });
    if (!progress) {
      throw new NotFoundException(`阅读进度 ${id} 未找到`);
    }
    return progress;
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<ReadingProgress | null> {
    return this.readingProgressRepository.findOne({
      where: { userId, bookId },
      relations: ['book', 'user'],
    });
  }

  async findByUser(userId: string): Promise<ReadingProgress[]> {
    return this.readingProgressRepository.find({
      where: { userId },
      relations: ['book', 'user'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findBookmarkedByUser(userId: string): Promise<ReadingProgress[]> {
    return this.readingProgressRepository.find({
      where: { userId, isBookmarked: true },
      relations: ['book', 'user'],
      order: { updatedAt: 'DESC' },
    });
  }

  async create(createReadingProgressInput: CreateReadingProgressInput): Promise<ReadingProgress> {
    const existing = await this.findByUserAndBook(
      createReadingProgressInput.userId,
      createReadingProgressInput.bookId,
    );
    if (existing) {
      return this.update(existing.id, createReadingProgressInput);
    }
    const progress = this.readingProgressRepository.create(createReadingProgressInput);
    return this.readingProgressRepository.save(progress);
  }

  async update(
    id: string,
    updateReadingProgressInput: UpdateReadingProgressInput,
  ): Promise<ReadingProgress> {
    const progress = await this.findOne(id);
    Object.assign(progress, updateReadingProgressInput);
    return this.readingProgressRepository.save(progress);
  }

  async remove(id: string): Promise<boolean> {
    const progress = await this.findOne(id);
    await this.readingProgressRepository.remove(progress);
    return true;
  }
}
