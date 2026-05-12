import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { Expense } from './expense.entity';

@Controller('api/expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  findAll(): Promise<Expense[]> {
    return this.expenseService.findAll();
  }

  @Get('total')
  getTotalExpenses(): Promise<number> {
    return this.expenseService.getTotalExpenses();
  }

  @Post()
  create(@Body() expense: Partial<Expense>): Promise<Expense> {
    return this.expenseService.create(expense);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.expenseService.delete(id);
  }
}