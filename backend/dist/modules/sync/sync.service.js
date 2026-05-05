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
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const database_service_1 = require("../database/database.service");
let SyncService = class SyncService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.activeSessions = new Map();
    }
    async startSyncSession(user, type, deviceId) {
        const session = {
            id: (0, uuid_1.v4)(),
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
    async updateSyncProgress(sessionId, progress, filesSynced) {
        const session = await this.databaseService.getSyncSessions().then((sessions) => sessions.find((s) => s.id === sessionId));
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
    async completeSyncSession(sessionId, success) {
        const session = await this.databaseService.getSyncSessions().then((sessions) => sessions.find((s) => s.id === sessionId));
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
    async getSyncStatus(sessionId) {
        return this.activeSessions.get(sessionId) || null;
    }
    async getUserSyncHistory(userId) {
        return this.databaseService.getSyncSessionsByUser(userId);
    }
    async getActiveSyncSessions(userId) {
        const sessions = await this.databaseService.getSyncSessionsByUser(userId);
        return sessions.filter((s) => s.status === 'active');
    }
    async checkFileChanges(user) {
        const allFiles = await this.databaseService.getFilesByOwner(user.id);
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;
        const newFiles = [];
        const modifiedFiles = [];
        const deletedFiles = [];
        for (const file of allFiles) {
            const createdTime = new Date(file.createdAt).getTime();
            const updatedTime = new Date(file.updatedAt).getTime();
            if (file.deleted) {
                if (updatedTime > oneHourAgo) {
                    deletedFiles.push(file);
                }
            }
            else if (createdTime > oneHourAgo) {
                newFiles.push(file);
            }
            else if (updatedTime > oneHourAgo && updatedTime !== createdTime) {
                modifiedFiles.push(file);
            }
        }
        return {
            newFiles,
            modifiedFiles,
            deletedFiles,
        };
    }
    async calculateSyncDelta(localFiles, cloudFiles) {
        const localFileMap = new Map(localFiles.map((f) => [f.path, f]));
        const cloudFileMap = new Map(cloudFiles.map((f) => [f.path, f]));
        const toUpload = [];
        const toDownload = [];
        const toDelete = [];
        for (const [path, localFile] of localFileMap) {
            const cloudFile = cloudFileMap.get(path);
            if (!cloudFile) {
                toUpload.push({ path: localFile.path, hash: localFile.hash });
            }
            else if (localFile.hash !== cloudFile.hash) {
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
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], SyncService);
//# sourceMappingURL=sync.service.js.map