import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripService } from './trip.service';
import { TripResolver } from './trip.resolver';
import { Trip } from './entities/trip.entity';
import { TripNode } from './entities/trip-node.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, TripNode])],
  providers: [TripResolver, TripService],
})
export class TripModule {}