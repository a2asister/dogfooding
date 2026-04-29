import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async create(userId: number, createTagDto: CreateTagDto): Promise<Tag> {
    const { name } = createTagDto;

    const existingTag = await this.tagsRepository.findOne({
      where: { userId, name },
    });

    if (existingTag) {
      return existingTag;
    }

    const tag = this.tagsRepository.create({
      userId,
      name,
    });

    return this.tagsRepository.save(tag);
  }

  async findAll(userId: number): Promise<Tag[]> {
    return this.tagsRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(userId: number, id: number): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({
      where: { id, userId },
      relations: ['notes'],
    });

    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    return tag;
  }

  async remove(userId: number, id: number): Promise<void> {
    const result = await this.tagsRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException('标签不存在');
    }
  }

  async findOrCreate(userId: number, tagNames: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];

    for (const name of tagNames) {
      let tag = await this.tagsRepository.findOne({
        where: { userId, name },
      });

      if (!tag) {
        tag = this.tagsRepository.create({ userId, name });
        tag = await this.tagsRepository.save(tag);
      }

      tags.push(tag);
    }

    return tags;
  }
}
