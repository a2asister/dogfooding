import { Response } from 'express';
import { FilesService } from './files.service';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
export declare class FilesController {
    private readonly filesService;
    private readonly usersService;
    constructor(filesService: FilesService, usersService: UsersService);
    private getCurrentUser;
    uploadFile(req: Request, file: Express.Multer.File, path?: string): Promise<{
        success: boolean;
        data: import("../database/database.service").FileRecord;
    }>;
    downloadFile(req: Request, fileId: string, res: Response): Promise<void>;
    getFiles(req: Request, path?: string): Promise<{
        success: boolean;
        data: import("../database/database.service").FileRecord[];
    }>;
    searchFiles(req: Request, query: string): Promise<{
        success: boolean;
        data: import("../database/database.service").FileRecord[];
    }>;
    getSensitiveFiles(req: Request): Promise<{
        success: boolean;
        data: import("../database/database.service").FileRecord[];
    }>;
    getStorageStats(req: Request): Promise<{
        success: boolean;
        data: {
            total: number;
            used: number;
            free: number;
            fileCount: number;
        };
    }>;
    getFileById(req: Request, fileId: string): Promise<{
        success: boolean;
        data: import("../database/database.service").FileRecord;
    }>;
    deleteFile(req: Request, fileId: string): Promise<{
        success: boolean;
        data: {
            deleted: boolean;
        };
    }>;
    renameFile(req: Request, fileId: string, newName: string): Promise<{
        success: boolean;
        data: import("../database/database.service").FileRecord;
    }>;
    moveFile(req: Request, fileId: string, newPath: string): Promise<{
        success: boolean;
        data: import("../database/database.service").FileRecord;
    }>;
    syncToLocal(req: Request, fileId: string, localDir: string): Promise<{
        success: boolean;
        data: import("../database/database.service").FileRecord;
    }>;
}
