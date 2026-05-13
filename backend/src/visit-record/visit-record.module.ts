import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitRecord } from './visit-record.entity';
import { VisitRecordService } from './visit-record.service';
import { VisitRecordResolver } from './visit-record.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([VisitRecord])],
  providers: [VisitRecordService, VisitRecordResolver],
  exports: [VisitRecordService],
})
export class VisitRecordModule {}