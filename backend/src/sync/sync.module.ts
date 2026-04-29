import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SyncRecord } from './entities/sync-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncRecord])],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService, TypeOrmModule],
})
export class SyncModule {}
