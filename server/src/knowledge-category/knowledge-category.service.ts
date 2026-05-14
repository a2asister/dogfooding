import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeCategory } from '../entities/knowledge-category.entity';
import { CreateKnowledgeCategoryDto } from './dto/create-knowledge-category.dto';
import { UpdateKnowledgeCategoryDto } from './dto/update-knowledge-category.dto';

@Injectable()
export class KnowledgeCategoryService {
  constructor(
    @InjectRepository(KnowledgeCategory)
    private readonly categoryRepository: Repository<KnowledgeCategory>,
  ) {}

  async create(createCategoryDto: CreateKnowledgeCategoryDto): Promise<KnowledgeCategory> {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<KnowledgeCategory[]> {
    return this.categoryRepository.find({ relations: ['notes'] });
  }

  async findOne(id: number): Promise<KnowledgeCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['notes'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateKnowledgeCategoryDto): Promise<KnowledgeCategory> {
    await this.categoryRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
