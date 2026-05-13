import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MealRecordService } from './meal-record.service';
import { MealRecord } from './meal-record.entity';
import { CreateMealRecordInput } from './dto/create-meal-record.input';

@Resolver(() => MealRecord)
export class MealRecordResolver {
  constructor(private mealRecordService: MealRecordService) {}

  @Query(() => [MealRecord])
  async mealRecords(): Promise<MealRecord[]> {
    return this.mealRecordService.findAll();
  }

  @Query(() => [MealRecord])
  async mealRecordsByDate(@Args('date') date: string): Promise<MealRecord[]> {
    return this.mealRecordService.findByDate(date);
  }

  @Query(() => [MealRecord])
  async mealRecordsByDateRange(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ): Promise<MealRecord[]> {
    return this.mealRecordService.findByDateRange(startDate, endDate);
  }

  @Mutation(() => MealRecord)
  async createMealRecord(
    @Args('createMealRecordInput') createMealRecordInput: CreateMealRecordInput,
  ): Promise<MealRecord> {
    return this.mealRecordService.create(createMealRecordInput);
  }

  @Mutation(() => Boolean)
  async deleteMealRecord(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.mealRecordService.delete(id);
  }
}
