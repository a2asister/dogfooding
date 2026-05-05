import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

// @ts-ignore
import { Low } from 'lowdb';
// @ts-ignore
import { JSONFile } from 'lowdb/node';

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  createdAt: string;
  privateKey: string;
  publicKey: string;
  syncDirectory: string;
}

export interface FileRecord {
  id: string;
  name: string;
  path: string;
  size: number;
  hash: string;
  mimeType: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  isEncrypted: boolean;
  isSensitive: boolean;
  isCached: boolean;
  localPath: string;
  lastSyncAt: string;
  deleted: boolean;
  encryptionKey: string;
  encryptionIv: string;
}

export interface ShareLink {
  id: string;
  fileId: string;
  ownerId: string;
  sharedWithUserId: string;
  permission: 'read' | 'write' | 'readwrite';
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

export interface SyncSession {
  id: string;
  userId: string;
  deviceId: string;
  type: 'lan' | 'cloud';
  status: 'active' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime: string;
  filesSynced: number;
}

export interface DatabaseSchema {
  users: User[];
  files: FileRecord[];
  shares: ShareLink[];
  syncSessions: SyncSession[];
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private db: Low<DatabaseSchema>;

  async onModuleInit() {
    const dbDir = join(__dirname, '..', '..', '..', 'data');
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    const adapter = new JSONFile<DatabaseSchema>(
      join(dbDir, 'database.json'),
    );
    this.db = new Low(adapter);

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

  async getUsers(): Promise<User[]> {
    await this.db.read();
    return this.db.data.users;
  }

  async getUserById(id: string): Promise<User | undefined> {
    await this.db.read();
    return this.db.data.users.find((u) => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.db.read();
    return this.db.data.users.find((u) => u.username === username);
  }

  async createUser(user: User): Promise<User> {
    await this.db.read();
    this.db.data.users.push(user);
    await this.db.write();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    await this.db.read();
    const index = this.db.data.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.db.data.users[index] = { ...this.db.data.users[index], ...updates };
      await this.db.write();
      return this.db.data.users[index];
    }
    return undefined;
  }

  async getFiles(): Promise<FileRecord[]> {
    await this.db.read();
    return this.db.data.files;
  }

  async getFilesByOwner(ownerId: string): Promise<FileRecord[]> {
    await this.db.read();
    return this.db.data.files.filter((f) => f.ownerId === ownerId && !f.deleted);
  }

  async getFileById(id: string): Promise<FileRecord | undefined> {
    await this.db.read();
    return this.db.data.files.find((f) => f.id === id);
  }

  async getFileByHash(hash: string): Promise<FileRecord | undefined> {
    await this.db.read();
    return this.db.data.files.find((f) => f.hash === hash && !f.deleted);
  }

  async createFile(file: FileRecord): Promise<FileRecord> {
    await this.db.read();
    this.db.data.files.push(file);
    await this.db.write();
    return file;
  }

  async updateFile(id: string, updates: Partial<FileRecord>): Promise<FileRecord | undefined> {
    await this.db.read();
    const index = this.db.data.files.findIndex((f) => f.id === id);
    if (index !== -1) {
      this.db.data.files[index] = { ...this.db.data.files[index], ...updates };
      await this.db.write();
      return this.db.data.files[index];
    }
    return undefined;
  }

  async deleteFile(id: string): Promise<boolean> {
    await this.db.read();
    const index = this.db.data.files.findIndex((f) => f.id === id);
    if (index !== -1) {
      this.db.data.files[index].deleted = true;
      await this.db.write();
      return true;
    }
    return false;
  }

  async getShares(): Promise<ShareLink[]> {
    await this.db.read();
    return this.db.data.shares;
  }

  async getSharesByFile(fileId: string): Promise<ShareLink[]> {
    await this.db.read();
    return this.db.data.shares.filter((s) => s.fileId === fileId && s.isActive);
  }

  async getSharesByUser(userId: string): Promise<ShareLink[]> {
    await this.db.read();
    return this.db.data.shares.filter((s) => s.sharedWithUserId === userId && s.isActive);
  }

  async createShare(share: ShareLink): Promise<ShareLink> {
    await this.db.read();
    this.db.data.shares.push(share);
    await this.db.write();
    return share;
  }

  async updateShare(id: string, updates: Partial<ShareLink>): Promise<ShareLink | undefined> {
    await this.db.read();
    const index = this.db.data.shares.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.db.data.shares[index] = { ...this.db.data.shares[index], ...updates };
      await this.db.write();
      return this.db.data.shares[index];
    }
    return undefined;
  }

  async getSyncSessions(): Promise<SyncSession[]> {
    await this.db.read();
    return this.db.data.syncSessions;
  }

  async getSyncSessionsByUser(userId: string): Promise<SyncSession[]> {
    await this.db.read();
    return this.db.data.syncSessions.filter((s) => s.userId === userId);
  }

  async createSyncSession(session: SyncSession): Promise<SyncSession> {
    await this.db.read();
    this.db.data.syncSessions.push(session);
    await this.db.write();
    return session;
  }

  async updateSyncSession(id: string, updates: Partial<SyncSession>): Promise<SyncSession | undefined> {
    await this.db.read();
    const index = this.db.data.syncSessions.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.db.data.syncSessions[index] = { ...this.db.data.syncSessions[index], ...updates };
      await this.db.write();
      return this.db.data.syncSessions[index];
    }
    return undefined;
  }
}
