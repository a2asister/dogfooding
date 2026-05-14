import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { CheckinEntity } from '../entities/checkin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CheckinEntity])],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
