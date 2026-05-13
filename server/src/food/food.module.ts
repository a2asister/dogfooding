import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodService } from './food.service';
import { FoodResolver } from './food.resolver';
import { Food } from './food.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Food])],
  providers: [FoodService, FoodResolver],
  exports: [FoodService],
})
export class FoodModule {}
