import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(userId: number, createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, color, icon } = createCategoryDto;

    const existingCategory = await this.categoriesRepository.findOne({
      where: { userId, name },
    });

    if (existingCategory) {
      throw new ConflictException('分类名称已存在');
    }

    const category = this.categoriesRepository.create({
      userId,
      name,
      color: color || '#3b82f6',
      icon: icon || 'folder',
    });

    return this.categoriesRepository.save(category);
  }

  async findAll(userId: number): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(userId: number, id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, userId },
      relations: ['notes'],
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return category;
  }

  async update(
    userId: number,
    id: number,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { userId, name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('分类名称已存在');
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(userId: number, id: number): Promise<void> {
    const result = await this.categoriesRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException('分类不存在');
    }
  }
}
