"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const path_1 = require("path");
const fs_1 = require("fs");
const database_service_1 = require("../database/database.service");
const crypto_service_1 = require("../crypto/crypto.service");
let FilesService = class FilesService {
    constructor(databaseService, cryptoService) {
        this.databaseService = databaseService;
        this.cryptoService = cryptoService;
    }
    getCloudStorageDir(userId) {
        const baseDir = (0, path_1.join)(__dirname, '..', '..', '..', '..', 'data', 'storage');
        const userDir = (0, path_1.join)(baseDir, userId);
        if (!(0, fs_1.existsSync)(userDir)) {
            (0, fs_1.mkdirSync)(userDir, { recursive: true });
        }
        return userDir;
    }
    getBackupDir(userId) {
        const baseDir = (0, path_1.join)(__dirname, '..', '..', '..', '..', 'data', 'backup');
        const userDir = (0, path_1.join)(baseDir, userId);
        if (!(0, fs_1.existsSync)(userDir)) {
            (0, fs_1.mkdirSync)(userDir, { recursive: true });
        }
        return userDir;
    }
    getFileExtension(filename) {
        return filename.slice(filename.lastIndexOf('.') + 1);
    }
    getMimeType(filename) {
        const ext = this.getFileExtension(filename).toLowerCase();
        const mimeTypes = {
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
    async uploadFile(user, fileBuffer, originalName, path = '/') {
        const fileHash = this.cryptoService.computeHash(fileBuffer);
        const existingFile = await this.databaseService.getFileByHash(fileHash);
        if (existingFile && existingFile.ownerId === user.id && !existingFile.deleted) {
            return existingFile;
        }
        const encryptionKey = this.cryptoService.generateRandomKey();
        const { encryptedData, iv } = this.cryptoService.encryptFile(fileBuffer, encryptionKey);
        const fileId = (0, uuid_1.v4)();
        const cloudDir = this.getCloudStorageDir(user.id);
        const cloudPath = (0, path_1.join)(cloudDir, `${fileId}.enc`);
        (0, fs_1.writeFileSync)(cloudPath, encryptedData);
        const backupDir = this.getBackupDir(user.id);
        const backupPath = (0, path_1.join)(backupDir, `${fileId}.enc`);
        (0, fs_1.writeFileSync)(backupPath, encryptedData);
        let fileContent = '';
        try {
            fileContent = fileBuffer.toString('utf-8');
        }
        catch (e) {
            fileContent = '';
        }
        const { isSensitive, types } = this.cryptoService.detectSensitiveContent(fileContent);
        const fileRecord = {
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
    async downloadFile(user, fileId) {
        const fileRecord = await this.databaseService.getFileById(fileId);
        if (!fileRecord || fileRecord.deleted) {
            throw new common_1.NotFoundException('File not found');
        }
        if (fileRecord.ownerId !== user.id) {
            const shares = await this.databaseService.getSharesByFile(fileId);
            const activeShare = shares.find((s) => s.sharedWithUserId === user.id && s.isActive);
            if (!activeShare) {
                throw new common_1.NotFoundException('File not found');
            }
            if (activeShare.expiresAt && new Date(activeShare.expiresAt) <= new Date()) {
                throw new common_1.NotFoundException('File not found');
            }
        }
        const cloudDir = this.getCloudStorageDir(fileRecord.ownerId);
        const cloudPath = (0, path_1.join)(cloudDir, `${fileId}.enc`);
        if (!(0, fs_1.existsSync)(cloudPath)) {
            throw new common_1.NotFoundException('File not found in storage');
        }
        const encryptedData = (0, fs_1.readFileSync)(cloudPath);
        const encryptionKey = fileRecord.encryptionKey;
        const iv = fileRecord.encryptionIv;
        const buffer = this.cryptoService.decryptFile(encryptedData, encryptionKey, iv);
        return {
            buffer,
            filename: fileRecord.name,
            mimeType: fileRecord.mimeType,
        };
    }
    async getFiles(user, path = '/') {
        const allFiles = await this.databaseService.getFilesByOwner(user.id);
        return allFiles.filter((f) => f.path === path);
    }
    async getFileById(user, fileId) {
        const file = await this.databaseService.getFileById(fileId);
        if (!file || file.deleted || file.ownerId !== user.id) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async deleteFile(user, fileId) {
        const file = await this.databaseService.getFileById(fileId);
        if (!file || file.deleted || file.ownerId !== user.id) {
            throw new common_1.NotFoundException('File not found');
        }
        return this.databaseService.deleteFile(fileId);
    }
    async renameFile(user, fileId, newName) {
        const file = await this.databaseService.getFileById(fileId);
        if (!file || file.deleted || file.ownerId !== user.id) {
            throw new common_1.NotFoundException('File not found');
        }
        return this.databaseService.updateFile(fileId, {
            name: newName,
            updatedAt: new Date().toISOString(),
        });
    }
    async moveFile(user, fileId, newPath) {
        const file = await this.databaseService.getFileById(fileId);
        if (!file || file.deleted || file.ownerId !== user.id) {
            throw new common_1.NotFoundException('File not found');
        }
        return this.databaseService.updateFile(fileId, {
            path: newPath,
            updatedAt: new Date().toISOString(),
        });
    }
    async getStorageStats(user) {
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
    async searchFiles(user, query) {
        const files = await this.databaseService.getFilesByOwner(user.id);
        const lowerQuery = query.toLowerCase();
        return files.filter((f) => f.name.toLowerCase().includes(lowerQuery) ||
            f.path.toLowerCase().includes(lowerQuery));
    }
    async getSensitiveFiles(user) {
        const files = await this.databaseService.getFilesByOwner(user.id);
        return files.filter((f) => f.isSensitive);
    }
    async syncToLocal(user, fileId, localDir) {
        const file = await this.databaseService.getFileById(fileId);
        if (!file || file.deleted || file.ownerId !== user.id) {
            throw new common_1.NotFoundException('File not found');
        }
        const cloudDir = this.getCloudStorageDir(user.id);
        const cloudPath = (0, path_1.join)(cloudDir, `${fileId}.enc`);
        if (!(0, fs_1.existsSync)(cloudPath)) {
            throw new common_1.NotFoundException('File not found in storage');
        }
        const localPath = (0, path_1.join)(localDir, file.name);
        (0, fs_1.copyFileSync)(cloudPath, localPath);
        return this.databaseService.updateFile(fileId, {
            isCached: true,
            localPath: localPath,
            lastSyncAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        crypto_service_1.CryptoService])
], FilesService);
//# sourceMappingURL=files.service.js.map