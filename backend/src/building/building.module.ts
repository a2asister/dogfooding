import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingService } from './building.service';
import { BuildingResolver } from './building.resolver';
import { Building } from '../entities/building.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Building])],
  providers: [BuildingService, BuildingResolver],
  exports: [BuildingService],
})
export class BuildingModule {}
