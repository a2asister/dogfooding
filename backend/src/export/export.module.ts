import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportResolver } from './export.resolver';

@Module({
  providers: [ExportService, ExportResolver],
  exports: [ExportService],
})
export class ExportModule {}
