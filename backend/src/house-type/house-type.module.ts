import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseTypeService } from './house-type.service';
import { HouseTypeResolver } from './house-type.resolver';
import { HouseType } from '../entities/house-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HouseType])],
  providers: [HouseTypeService, HouseTypeResolver],
  exports: [HouseTypeService],
})
export class HouseTypeModule {}
