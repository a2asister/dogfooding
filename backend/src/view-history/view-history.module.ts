import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewHistory } from '../entities/view-history.entity';
import { ViewHistoryService } from './view-history.service';
import { ViewHistoryController } from './view-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ViewHistory])],
  providers: [ViewHistoryService],
  controllers: [ViewHistoryController],
})
export class ViewHistoryModule {}
