import { DatabaseService, ShareLink, User, FileRecord } from '../database/database.service';
export declare class ShareService {
    private databaseService;
    constructor(databaseService: DatabaseService);
    createShare(owner: User, fileId: string, sharedWithUsername: string, permission: 'read' | 'write' | 'readwrite', expiresInHours?: number): Promise<ShareLink>;
    getShareById(shareId: string): Promise<ShareLink>;
    getSharesByOwner(owner: User): Promise<(ShareLink & {
        file: FileRecord;
        sharedWith: {
            id: string;
            username: string;
        };
    })[]>;
    getSharesSharedWithUser(user: User): Promise<(ShareLink & {
        file: FileRecord;
        owner: {
            id: string;
            username: string;
        };
    })[]>;
    revokeShare(owner: User, shareId: string): Promise<boolean>;
    updateSharePermission(owner: User, shareId: string, permission: 'read' | 'write' | 'readwrite'): Promise<ShareLink>;
    checkPermission(user: User, fileId: string, requiredPermission: 'read' | 'write' | 'readwrite'): Promise<boolean>;
}
