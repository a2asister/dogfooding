import { DatabaseService, FileRecord, User } from '../database/database.service';
import { CryptoService } from '../crypto/crypto.service';
export declare class FilesService {
    private databaseService;
    private cryptoService;
    constructor(databaseService: DatabaseService, cryptoService: CryptoService);
    private getCloudStorageDir;
    private getBackupDir;
    private getFileExtension;
    private getMimeType;
    uploadFile(user: User, fileBuffer: Buffer, originalName: string, path?: string): Promise<FileRecord>;
    downloadFile(user: User, fileId: string): Promise<{
        buffer: Buffer;
        filename: string;
        mimeType: string;
    }>;
    getFiles(user: User, path?: string): Promise<FileRecord[]>;
    getFileById(user: User, fileId: string): Promise<FileRecord>;
    deleteFile(user: User, fileId: string): Promise<boolean>;
    renameFile(user: User, fileId: string, newName: string): Promise<FileRecord>;
    moveFile(user: User, fileId: string, newPath: string): Promise<FileRecord>;
    getStorageStats(user: User): Promise<{
        total: number;
        used: number;
        free: number;
        fileCount: number;
    }>;
    searchFiles(user: User, query: string): Promise<FileRecord[]>;
    getSensitiveFiles(user: User): Promise<FileRecord[]>;
    syncToLocal(user: User, fileId: string, localDir: string): Promise<FileRecord>;
}
