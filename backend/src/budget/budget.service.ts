import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './budget.entity';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  async findAll(): Promise<Budget[]> {
    return this.budgetRepository.find();
  }

  async findOne(id: number): Promise<Budget> {
    return this.budgetRepository.findOneBy({ id });
  }

  async create(budget: Partial<Budget>): Promise<Budget> {
    const newBudget = this.budgetRepository.create(budget);
    return this.budgetRepository.save(newBudget);
  }

  async update(id: number, budget: Partial<Budget>): Promise<Budget> {
    await this.budgetRepository.update(id, budget);
    return this.budgetRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    await this.budgetRepository.delete(id);
  }
}