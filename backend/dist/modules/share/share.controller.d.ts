import { Request } from 'express';
import { ShareService } from './share.service';
import { UsersService } from '../users/users.service';
export declare class ShareController {
    private readonly shareService;
    private readonly usersService;
    constructor(shareService: ShareService, usersService: UsersService);
    private getCurrentUser;
    createShare(req: Request, body: {
        fileId: string;
        sharedWithUsername: string;
        permission: 'read' | 'write' | 'readwrite';
        expiresInHours?: number;
    }): Promise<{
        success: boolean;
        data: import("../database/database.service").ShareLink;
    }>;
    getMyShares(req: Request): Promise<{
        success: boolean;
        data: (import("../database/database.service").ShareLink & {
            file: import("../database/database.service").FileRecord;
            sharedWith: {
                id: string;
                username: string;
            };
        })[];
    }>;
    getSharedWithMe(req: Request): Promise<{
        success: boolean;
        data: (import("../database/database.service").ShareLink & {
            file: import("../database/database.service").FileRecord;
            owner: {
                id: string;
                username: string;
            };
        })[];
    }>;
    getShareById(shareId: string): Promise<{
        success: boolean;
        data: import("../database/database.service").ShareLink;
    }>;
    revokeShare(req: Request, shareId: string): Promise<{
        success: boolean;
        data: {
            revoked: boolean;
        };
    }>;
    updatePermission(req: Request, shareId: string, permission: 'read' | 'write' | 'readwrite'): Promise<{
        success: boolean;
        data: import("../database/database.service").ShareLink;
    }>;
    checkPermission(req: Request, body: {
        fileId: string;
        permission: 'read' | 'write' | 'readwrite';
    }): Promise<{
        success: boolean;
        data: {
            hasPermission: boolean;
        };
    }>;
}
