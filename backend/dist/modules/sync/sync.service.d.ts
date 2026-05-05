import { DatabaseService, SyncSession, User, FileRecord } from '../database/database.service';
export declare class SyncService {
    private databaseService;
    private activeSessions;
    constructor(databaseService: DatabaseService);
    startSyncSession(user: User, type: 'lan' | 'cloud', deviceId: string): Promise<SyncSession>;
    updateSyncProgress(sessionId: string, progress: number, filesSynced: number): Promise<SyncSession | undefined>;
    completeSyncSession(sessionId: string, success: boolean): Promise<SyncSession | undefined>;
    getSyncStatus(sessionId: string): Promise<{
        progress: number;
        status: string;
    } | null>;
    getUserSyncHistory(userId: string): Promise<SyncSession[]>;
    getActiveSyncSessions(userId: string): Promise<SyncSession[]>;
    checkFileChanges(user: User): Promise<{
        newFiles: FileRecord[];
        modifiedFiles: FileRecord[];
        deletedFiles: FileRecord[];
    }>;
    calculateSyncDelta(localFiles: {
        path: string;
        hash: string;
        size: number;
    }[], cloudFiles: FileRecord[]): Promise<{
        toUpload: {
            path: string;
            hash: string;
        }[];
        toDownload: FileRecord[];
        toDelete: FileRecord[];
    }>;
}
