import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Upload } from '../upload/upload.entity';
import { Work } from '../work/work.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Upload, Work])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
