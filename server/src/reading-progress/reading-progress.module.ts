import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingProgressService } from './reading-progress.service';
import { ReadingProgressResolver } from './reading-progress.resolver';
import { ReadingProgress } from './reading-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReadingProgress])],
  providers: [ReadingProgressService, ReadingProgressResolver],
  exports: [ReadingProgressService],
})
export class ReadingProgressModule {}
