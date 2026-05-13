import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrowseRecordService } from './browse-record.service';
import { BrowseRecordResolver } from './browse-record.resolver';
import { BrowseRecord } from '../entities/browse-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BrowseRecord])],
  providers: [BrowseRecordService, BrowseRecordResolver],
  exports: [BrowseRecordService],
})
export class BrowseRecordModule {}
