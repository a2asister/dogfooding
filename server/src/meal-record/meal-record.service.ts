import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealRecord } from './meal-record.entity';
import { CreateMealRecordInput } from './dto/create-meal-record.input';

@Injectable()
export class MealRecordService {
  constructor(
    @InjectRepository(MealRecord)
    private mealRecordRepository: Repository<MealRecord>,
  ) {}

  async findAll(): Promise<MealRecord[]> {
    return this.mealRecordRepository.find({ relations: ['food'] });
  }

  async findByDate(date: string): Promise<MealRecord[]> {
    return this.mealRecordRepository.find({
      where: { date },
      relations: ['food'],
    });
  }

  async create(createMealRecordInput: CreateMealRecordInput): Promise<MealRecord> {
    const mealRecord = this.mealRecordRepository.create(createMealRecordInput);
    const saved = await this.mealRecordRepository.save(mealRecord);
    return this.mealRecordRepository.findOne({
      where: { id: saved.id },
      relations: ['food'],
    }) as Promise<MealRecord>;
  }

  async findByDateRange(startDate: string, endDate: string): Promise<MealRecord[]> {
    return this.mealRecordRepository
      .createQueryBuilder('mealRecord')
      .leftJoinAndSelect('mealRecord.food', 'food')
      .where('mealRecord.date >= :startDate', { startDate })
      .andWhere('mealRecord.date <= :endDate', { endDate })
      .getMany();
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.mealRecordRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
