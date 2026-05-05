import { Request } from 'express';
import { SyncService } from './sync.service';
import { UsersService } from '../users/users.service';
export declare class SyncController {
    private readonly syncService;
    private readonly usersService;
    constructor(syncService: SyncService, usersService: UsersService);
    private getCurrentUser;
    startSync(req: Request, body: {
        type: 'lan' | 'cloud';
        deviceId: string;
    }): Promise<{
        success: boolean;
        data: import("../database/database.service").SyncSession;
    }>;
    updateProgress(sessionId: string, body: {
        progress: number;
        filesSynced: number;
    }): Promise<{
        success: boolean;
        data: import("../database/database.service").SyncSession;
    }>;
    completeSync(sessionId: string, body: {
        success: boolean;
    }): Promise<{
        success: boolean;
        data: import("../database/database.service").SyncSession;
    }>;
    getSyncStatus(sessionId: string): Promise<{
        success: boolean;
        data: {
            progress: number;
            status: string;
        };
    }>;
    getSyncHistory(req: Request): Promise<{
        success: boolean;
        data: import("../database/database.service").SyncSession[];
    }>;
    getActiveSessions(req: Request): Promise<{
        success: boolean;
        data: import("../database/database.service").SyncSession[];
    }>;
    checkFileChanges(req: Request): Promise<{
        success: boolean;
        data: {
            newFiles: import("../database/database.service").FileRecord[];
            modifiedFiles: import("../database/database.service").FileRecord[];
            deletedFiles: import("../database/database.service").FileRecord[];
        };
    }>;
    calculateDelta(req: Request, body: {
        localFiles: {
            path: string;
            hash: string;
            size: number;
        }[];
    }): Promise<{
        success: boolean;
        data: {
            toUpload: {
                path: string;
                hash: string;
            }[];
            toDownload: import("../database/database.service").FileRecord[];
            toDelete: import("../database/database.service").FileRecord[];
        };
    }>;
}
