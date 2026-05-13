import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealRecordService } from './meal-record.service';
import { MealRecordResolver } from './meal-record.resolver';
import { MealRecord } from './meal-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MealRecord])],
  providers: [MealRecordService, MealRecordResolver],
})
export class MealRecordModule {}
