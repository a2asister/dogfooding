import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SyncRecord, SyncAction, SyncStatus } from './entities/sync-record.entity';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncRecord)
    private syncRecordsRepository: Repository<SyncRecord>,
  ) {}

  async getSyncStatus(userId: number): Promise<{
    pending: number;
    lastSyncAt: Date | null;
  }> {
    const pendingCount = await this.syncRecordsRepository.count({
      where: { userId, syncStatus: SyncStatus.PENDING },
    });

    const lastSync = await this.syncRecordsRepository.findOne({
      where: { userId, syncStatus: SyncStatus.SUCCESS },
      order: { syncTimestamp: 'DESC' },
    });

    return {
      pending: pendingCount,
      lastSyncAt: lastSync?.syncTimestamp || null,
    };
  }

  async getPendingChanges(userId: number, since?: Date): Promise<SyncRecord[]> {
    const query = this.syncRecordsRepository
      .createQueryBuilder('sync')
      .where('sync.userId = :userId', { userId })
      .andWhere('sync.syncStatus = :status', { status: SyncStatus.PENDING });

    if (since) {
      query.andWhere('sync.syncTimestamp > :since', { since });
    }

    return query
      .orderBy('sync.syncTimestamp', 'ASC')
      .getMany();
  }

  async markAsSynced(userId: number, recordIds: number[]): Promise<void> {
    await this.syncRecordsRepository.update(
      { id: In(recordIds), userId },
      { syncStatus: SyncStatus.SUCCESS }
    );
  }

  async syncAll(userId: number): Promise<{
    synced: number;
    failed: number;
  }> {
    const pendingRecords = await this.syncRecordsRepository.find({
      where: { userId, syncStatus: SyncStatus.PENDING },
    });

    let synced = 0;
    let failed = 0;

    for (const record of pendingRecords) {
      try {
        record.syncStatus = SyncStatus.SUCCESS;
        await this.syncRecordsRepository.save(record);
        synced++;
      } catch (error) {
        record.syncStatus = SyncStatus.FAILED;
        await this.syncRecordsRepository.save(record);
        failed++;
      }
    }

    return { synced, failed };
  }

  async createSyncRecord(
    userId: number,
    noteId: number,
    action: SyncAction,
    deviceInfo?: Record<string, any>
  ): Promise<SyncRecord> {
    const syncRecord = this.syncRecordsRepository.create({
      userId,
      noteId,
      action,
      syncStatus: SyncStatus.PENDING,
      deviceInfo,
    });

    return this.syncRecordsRepository.save(syncRecord);
  }

  async getSyncHistory(
    userId: number,
    limit: number = 50
  ): Promise<SyncRecord[]> {
    return this.syncRecordsRepository.find({
      where: { userId },
      order: { syncTimestamp: 'DESC' },
      take: limit,
    });
  }
}
