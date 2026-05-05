"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
const lowdb_1 = require("lowdb");
const node_1 = require("lowdb/node");
let DatabaseService = class DatabaseService {
    async onModuleInit() {
        const dbDir = (0, path_1.join)(__dirname, '..', '..', '..', 'data');
        if (!(0, fs_1.existsSync)(dbDir)) {
            (0, fs_1.mkdirSync)(dbDir, { recursive: true });
        }
        const adapter = new node_1.JSONFile((0, path_1.join)(dbDir, 'database.json'));
        this.db = new lowdb_1.Low(adapter);
        await this.db.read();
        if (!this.db.data) {
            this.db.data = {
                users: [],
                files: [],
                shares: [],
                syncSessions: [],
            };
            await this.db.write();
        }
    }
    async getUsers() {
        await this.db.read();
        return this.db.data.users;
    }
    async getUserById(id) {
        await this.db.read();
        return this.db.data.users.find((u) => u.id === id);
    }
    async getUserByUsername(username) {
        await this.db.read();
        return this.db.data.users.find((u) => u.username === username);
    }
    async createUser(user) {
        await this.db.read();
        this.db.data.users.push(user);
        await this.db.write();
        return user;
    }
    async updateUser(id, updates) {
        await this.db.read();
        const index = this.db.data.users.findIndex((u) => u.id === id);
        if (index !== -1) {
            this.db.data.users[index] = { ...this.db.data.users[index], ...updates };
            await this.db.write();
            return this.db.data.users[index];
        }
        return undefined;
    }
    async getFiles() {
        await this.db.read();
        return this.db.data.files;
    }
    async getFilesByOwner(ownerId) {
        await this.db.read();
        return this.db.data.files.filter((f) => f.ownerId === ownerId && !f.deleted);
    }
    async getFileById(id) {
        await this.db.read();
        return this.db.data.files.find((f) => f.id === id);
    }
    async getFileByHash(hash) {
        await this.db.read();
        return this.db.data.files.find((f) => f.hash === hash && !f.deleted);
    }
    async createFile(file) {
        await this.db.read();
        this.db.data.files.push(file);
        await this.db.write();
        return file;
    }
    async updateFile(id, updates) {
        await this.db.read();
        const index = this.db.data.files.findIndex((f) => f.id === id);
        if (index !== -1) {
            this.db.data.files[index] = { ...this.db.data.files[index], ...updates };
            await this.db.write();
            return this.db.data.files[index];
        }
        return undefined;
    }
    async deleteFile(id) {
        await this.db.read();
        const index = this.db.data.files.findIndex((f) => f.id === id);
        if (index !== -1) {
            this.db.data.files[index].deleted = true;
            await this.db.write();
            return true;
        }
        return false;
    }
    async getShares() {
        await this.db.read();
        return this.db.data.shares;
    }
    async getSharesByFile(fileId) {
        await this.db.read();
        return this.db.data.shares.filter((s) => s.fileId === fileId && s.isActive);
    }
    async getSharesByUser(userId) {
        await this.db.read();
        return this.db.data.shares.filter((s) => s.sharedWithUserId === userId && s.isActive);
    }
    async createShare(share) {
        await this.db.read();
        this.db.data.shares.push(share);
        await this.db.write();
        return share;
    }
    async updateShare(id, updates) {
        await this.db.read();
        const index = this.db.data.shares.findIndex((s) => s.id === id);
        if (index !== -1) {
            this.db.data.shares[index] = { ...this.db.data.shares[index], ...updates };
            await this.db.write();
            return this.db.data.shares[index];
        }
        return undefined;
    }
    async getSyncSessions() {
        await this.db.read();
        return this.db.data.syncSessions;
    }
    async getSyncSessionsByUser(userId) {
        await this.db.read();
        return this.db.data.syncSessions.filter((s) => s.userId === userId);
    }
    async createSyncSession(session) {
        await this.db.read();
        this.db.data.syncSessions.push(session);
        await this.db.write();
        return session;
    }
    async updateSyncSession(id, updates) {
        await this.db.read();
        const index = this.db.data.syncSessions.findIndex((s) => s.id === id);
        if (index !== -1) {
            this.db.data.syncSessions[index] = { ...this.db.data.syncSessions[index], ...updates };
            await this.db.write();
            return this.db.data.syncSessions[index];
        }
        return undefined;
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
//# sourceMappingURL=database.service.js.map