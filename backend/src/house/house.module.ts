import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseService } from './house.service';
import { HouseResolver } from './house.resolver';
import { House } from '../entities/house.entity';

@Module({
  imports: [TypeOrmModule.forFeature([House])],
  providers: [HouseService, HouseResolver],
  exports: [HouseService],
})
export class HouseModule {}
