import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { Budget } from './budget.entity';

@Controller('api/budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  findAll(): Promise<Budget[]> {
    return this.budgetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Budget> {
    return this.budgetService.findOne(id);
  }

  @Post()
  create(@Body() budget: Partial<Budget>): Promise<Budget> {
    return this.budgetService.create(budget);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() budget: Partial<Budget>): Promise<Budget> {
    return this.budgetService.update(id, budget);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.budgetService.delete(id);
  }
}