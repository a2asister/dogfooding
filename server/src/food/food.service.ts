import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Food } from './food.entity';
import { CreateFoodInput } from './dto/create-food.input';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
  ) {}

  async findAll(): Promise<Food[]> {
    return this.foodRepository.find();
  }

  async findOne(id: number): Promise<Food> {
    const food = await this.foodRepository.findOne({ where: { id } });
    if (!food) {
      throw new NotFoundException(`Food with ID ${id} not found`);
    }
    return food;
  }

  async create(createFoodInput: CreateFoodInput): Promise<Food> {
    const food = this.foodRepository.create(createFoodInput);
    return this.foodRepository.save(food);
  }

  async findByCategory(category: string): Promise<Food[]> {
    return this.foodRepository.find({ where: { category } });
  }

  async getCategories(): Promise<string[]> {
    const foods = await this.foodRepository
      .createQueryBuilder('food')
      .select('DISTINCT food.category', 'category')
      .getRawMany();
    return foods.map((f) => f.category);
  }
}
