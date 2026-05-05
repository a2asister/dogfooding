import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { join, basename, dirname } from 'path';
import { 
  existsSync, 
  mkdirSync, 
  writeFileSync, 
  readFileSync, 
  unlinkSync, 
  copyFileSync,
  renameSync,
  statSync 
} from 'fs';
import { DatabaseService, FileRecord, User } from '../database/database.service';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class FilesService {
  constructor(
    private databaseService: DatabaseService,
    private cryptoService: CryptoService,
  ) {}

  private getCloudStorageDir(userId: string): string {
    const baseDir = join(__dirname, '..', '..', '..', '..', 'data', 'storage');
    const userDir = join(baseDir, userId);
    if (!existsSync(userDir)) {
      mkdirSync(userDir, { recursive: true });
    }
    return userDir;
  }

  private getBackupDir(userId: string): string {
    const baseDir = join(__dirname, '..', '..', '..', '..', 'data', 'backup');
    const userDir = join(baseDir, userId);
    if (!existsSync(userDir)) {
      mkdirSync(userDir, { recursive: true });
    }
    return userDir;
  }

  private getFileExtension(filename: string): string {
    return filename.slice(filename.lastIndexOf('.') + 1);
  }

  private getMimeType(filename: string): string {
    const ext = this.getFileExtension(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      webp: 'image/webp',
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mkv: 'video/x-matroska',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      js: 'text/javascript',
      ts: 'text/typescript',
      html: 'text/html',
      css: 'text/css',
      json: 'application/json',
      xml: 'application/xml',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  async uploadFile(
    user: User,
    fileBuffer: Buffer,
    originalName: string,
    path: string = '/',
  ): Promise<FileRecord> {
    const fileHash = this.cryptoService.computeHash(fileBuffer);
    
    const existingFile = await this.databaseService.getFileByHash(fileHash);
    if (existingFile && existingFile.ownerId === user.id && !existingFile.deleted) {
      return existingFile;
    }

    const encryptionKey = this.cryptoService.generateRandomKey();
    const { encryptedData, iv } = this.cryptoService.encryptFile(
      fileBuffer,
      encryptionKey,
    );

    const fileId = uuidv4();
    const cloudDir = this.getCloudStorageDir(user.id);
    const cloudPath = join(cloudDir, `${fileId}.enc`);
    
    writeFileSync(cloudPath, encryptedData);

    const backupDir = this.getBackupDir(user.id);
    const backupPath = join(backupDir, `${fileId}.enc`);
    writeFileSync(backupPath, encryptedData);

    let fileContent = '';
    try {
      fileContent = fileBuffer.toString('utf-8');
    } catch (e) {
      fileContent = '';
    }
    const { isSensitive, types } = this.cryptoService.detectSensitiveContent(fileContent);

    const fileRecord: FileRecord = {
      id: fileId,
      name: originalName,
      path: path,
      size: fileBuffer.length,
      hash: fileHash,
      mimeType: this.getMimeType(originalName),
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEncrypted: true,
      isSensitive: isSensitive,
      isCached: false,
      localPath: '',
      lastSyncAt: new Date().toISOString(),
      deleted: false,
      encryptionKey: encryptionKey,
      encryptionIv: iv,
    };

    return this.databaseService.createFile(fileRecord);
  }

  async downloadFile(
    user: User,
    fileId: string,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const fileRecord = await this.databaseService.getFileById(fileId);
    if (!fileRecord || fileRecord.deleted) {
      throw new NotFoundException('File not found');
    }

    if (fileRecord.ownerId !== user.id) {
      const shares = await this.databaseService.getSharesByFile(fileId);
      const activeShare = shares.find(
        (s) => s.sharedWithUserId === user.id && s.isActive,
      );
      if (!activeShare) {
        throw new NotFoundException('File not found');
      }
      if (activeShare.expiresAt && new Date(activeShare.expiresAt) <= new Date()) {
        throw new NotFoundException('File not found');
      }
    }

    const cloudDir = this.getCloudStorageDir(fileRecord.ownerId);
    const cloudPath = join(cloudDir, `${fileId}.enc`);
    
    if (!existsSync(cloudPath)) {
      throw new NotFoundException('File not found in storage');
    }

    const encryptedData = readFileSync(cloudPath);
    
    const encryptionKey = fileRecord.encryptionKey;
    const iv = fileRecord.encryptionIv;
    
    const buffer = this.cryptoService.decryptFile(encryptedData, encryptionKey, iv);

    return {
      buffer,
      filename: fileRecord.name,
      mimeType: fileRecord.mimeType,
    };
  }

  async getFiles(user: User, path: string = '/'): Promise<FileRecord[]> {
    const allFiles = await this.databaseService.getFilesByOwner(user.id);
    return allFiles.filter((f) => f.path === path);
  }

  async getFileById(user: User, fileId: string): Promise<FileRecord> {
    const file = await this.databaseService.getFileById(fileId);
    if (!file || file.deleted || file.ownerId !== user.id) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async deleteFile(user: User, fileId: string): Promise<boolean> {
    const file = await this.databaseService.getFileById(fileId);
    if (!file || file.deleted || file.ownerId !== user.id) {
      throw new NotFoundException('File not found');
    }

    return this.databaseService.deleteFile(fileId);
  }

  async renameFile(user: User, fileId: string, newName: string): Promise<FileRecord> {
    const file = await this.databaseService.getFileById(fileId);
    if (!file || file.deleted || file.ownerId !== user.id) {
      throw new NotFoundException('File not found');
    }

    return this.databaseService.updateFile(fileId, {
      name: newName,
      updatedAt: new Date().toISOString(),
    });
  }

  async moveFile(user: User, fileId: string, newPath: string): Promise<FileRecord> {
    const file = await this.databaseService.getFileById(fileId);
    if (!file || file.deleted || file.ownerId !== user.id) {
      throw new NotFoundException('File not found');
    }

    return this.databaseService.updateFile(fileId, {
      path: newPath,
      updatedAt: new Date().toISOString(),
    });
  }

  async getStorageStats(user: User): Promise<{
    total: number;
    used: number;
    free: number;
    fileCount: number;
  }> {
    const files = await this.databaseService.getFilesByOwner(user.id);
    const used = files.reduce((sum, f) => sum + f.size, 0);
    const total = 10 * 1024 * 1024 * 1024;
    const free = total - used;

    return {
      total,
      used,
      free,
      fileCount: files.length,
    };
  }

  async searchFiles(user: User, query: string): Promise<FileRecord[]> {
    const files = await this.databaseService.getFilesByOwner(user.id);
    const lowerQuery = query.toLowerCase();
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(lowerQuery) ||
        f.path.toLowerCase().includes(lowerQuery),
    );
  }

  async getSensitiveFiles(user: User): Promise<FileRecord[]> {
    const files = await this.databaseService.getFilesByOwner(user.id);
    return files.filter((f) => f.isSensitive);
  }

  async syncToLocal(user: User, fileId: string, localDir: string): Promise<FileRecord> {
    const file = await this.databaseService.getFileById(fileId);
    if (!file || file.deleted || file.ownerId !== user.id) {
      throw new NotFoundException('File not found');
    }

    const cloudDir = this.getCloudStorageDir(user.id);
    const cloudPath = join(cloudDir, `${fileId}.enc`);
    
    if (!existsSync(cloudPath)) {
      throw new NotFoundException('File not found in storage');
    }

    const localPath = join(localDir, file.name);
    copyFileSync(cloudPath, localPath);

    return this.databaseService.updateFile(fileId, {
      isCached: true,
      localPath: localPath,
      lastSyncAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}
