import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService, SyncSession, User, FileRecord } from '../database/database.service';

@Injectable()
export class SyncService {
  private activeSessions: Map<string, { progress: number; status: string }> = new Map();

  constructor(private databaseService: DatabaseService) {}

  async startSyncSession(
    user: User,
    type: 'lan' | 'cloud',
    deviceId: string,
  ): Promise<SyncSession> {
    const session: SyncSession = {
      id: uuidv4(),
      userId: user.id,
      deviceId,
      type,
      status: 'active',
      progress: 0,
      startTime: new Date().toISOString(),
      endTime: '',
      filesSynced: 0,
    };

    this.activeSessions.set(session.id, {
      progress: 0,
      status: 'active',
    });

    return this.databaseService.createSyncSession(session);
  }

  async updateSyncProgress(
    sessionId: string,
    progress: number,
    filesSynced: number,
  ): Promise<SyncSession | undefined> {
    const session = await this.databaseService.getSyncSessions().then((sessions) =>
      sessions.find((s) => s.id === sessionId),
    );

    if (!session) {
      return undefined;
    }

    this.activeSessions.set(sessionId, {
      progress,
      status: 'active',
    });

    return this.databaseService.updateSyncSession(sessionId, {
      progress,
      filesSynced,
    });
  }

  async completeSyncSession(sessionId: string, success: boolean): Promise<SyncSession | undefined> {
    const session = await this.databaseService.getSyncSessions().then((sessions) =>
      sessions.find((s) => s.id === sessionId),
    );

    if (!session) {
      return undefined;
    }

    this.activeSessions.set(sessionId, {
      progress: 100,
      status: success ? 'completed' : 'failed',
    });

    return this.databaseService.updateSyncSession(sessionId, {
      status: success ? 'completed' : 'failed',
      progress: success ? 100 : session.progress,
      endTime: new Date().toISOString(),
    });
  }

  async getSyncStatus(sessionId: string): Promise<{
    progress: number;
    status: string;
  } | null> {
    return this.activeSessions.get(sessionId) || null;
  }

  async getUserSyncHistory(userId: string): Promise<SyncSession[]> {
    return this.databaseService.getSyncSessionsByUser(userId);
  }

  async getActiveSyncSessions(userId: string): Promise<SyncSession[]> {
    const sessions = await this.databaseService.getSyncSessionsByUser(userId);
    return sessions.filter((s) => s.status === 'active');
  }

  async checkFileChanges(user: User): Promise<{
    newFiles: FileRecord[];
    modifiedFiles: FileRecord[];
    deletedFiles: FileRecord[];
  }> {
    const allFiles = await this.databaseService.getFilesByOwner(user.id);
    
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const newFiles: FileRecord[] = [];
    const modifiedFiles: FileRecord[] = [];
    const deletedFiles: FileRecord[] = [];

    for (const file of allFiles) {
      const createdTime = new Date(file.createdAt).getTime();
      const updatedTime = new Date(file.updatedAt).getTime();

      if (file.deleted) {
        if (updatedTime > oneHourAgo) {
          deletedFiles.push(file);
        }
      } else if (createdTime > oneHourAgo) {
        newFiles.push(file);
      } else if (updatedTime > oneHourAgo && updatedTime !== createdTime) {
        modifiedFiles.push(file);
      }
    }

    return {
      newFiles,
      modifiedFiles,
      deletedFiles,
    };
  }

  async calculateSyncDelta(
    localFiles: { path: string; hash: string; size: number }[],
    cloudFiles: FileRecord[],
  ): Promise<{
    toUpload: { path: string; hash: string }[];
    toDownload: FileRecord[];
    toDelete: FileRecord[];
  }> {
    const localFileMap = new Map(localFiles.map((f) => [f.path, f]));
    const cloudFileMap = new Map(cloudFiles.map((f) => [f.path, f]));

    const toUpload: { path: string; hash: string }[] = [];
    const toDownload: FileRecord[] = [];
    const toDelete: FileRecord[] = [];

    for (const [path, localFile] of localFileMap) {
      const cloudFile = cloudFileMap.get(path);
      if (!cloudFile) {
        toUpload.push({ path: localFile.path, hash: localFile.hash });
      } else if (localFile.hash !== cloudFile.hash) {
        toUpload.push({ path: localFile.path, hash: localFile.hash });
      }
    }

    for (const [path, cloudFile] of cloudFileMap) {
      if (!localFileMap.has(path) && !cloudFile.deleted) {
        toDownload.push(cloudFile);
      }
    }

    for (const cloudFile of cloudFiles) {
      if (cloudFile.deleted) {
        toDelete.push(cloudFile);
      }
    }

    return {
      toUpload,
      toDownload,
      toDelete,
    };
  }
}
