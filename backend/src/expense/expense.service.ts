import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async findAll(): Promise<Expense[]> {
    return this.expenseRepository.find({ order: { createdAt: 'DESC' } });
  }

  async create(expense: Partial<Expense>): Promise<Expense> {
    const newExpense = this.expenseRepository.create(expense);
    return this.expenseRepository.save(newExpense);
  }

  async delete(id: number): Promise<void> {
    await this.expenseRepository.delete(id);
  }

  async getTotalExpenses(): Promise<number> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .getRawOne();
    return parseFloat(result.total) || 0;
  }
}