import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { ExportRecord } from '../entity/ExportRecord';

@Module({
  imports: [TypeOrmModule.forFeature([ExportRecord])],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
