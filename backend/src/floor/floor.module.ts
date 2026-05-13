import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FloorService } from './floor.service';
import { FloorResolver } from './floor.resolver';
import { Floor } from '../entities/floor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Floor])],
  providers: [FloorService, FloorResolver],
  exports: [FloorService],
})
export class FloorModule {}
