import { OnModuleInit } from '@nestjs/common';
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
export declare class DatabaseService implements OnModuleInit {
    private db;
    onModuleInit(): Promise<void>;
    getUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: User): Promise<User>;
    updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
    getFiles(): Promise<FileRecord[]>;
    getFilesByOwner(ownerId: string): Promise<FileRecord[]>;
    getFileById(id: string): Promise<FileRecord | undefined>;
    getFileByHash(hash: string): Promise<FileRecord | undefined>;
    createFile(file: FileRecord): Promise<FileRecord>;
    updateFile(id: string, updates: Partial<FileRecord>): Promise<FileRecord | undefined>;
    deleteFile(id: string): Promise<boolean>;
    getShares(): Promise<ShareLink[]>;
    getSharesByFile(fileId: string): Promise<ShareLink[]>;
    getSharesByUser(userId: string): Promise<ShareLink[]>;
    createShare(share: ShareLink): Promise<ShareLink>;
    updateShare(id: string, updates: Partial<ShareLink>): Promise<ShareLink | undefined>;
    getSyncSessions(): Promise<SyncSession[]>;
    getSyncSessionsByUser(userId: string): Promise<SyncSession[]>;
    createSyncSession(session: SyncSession): Promise<SyncSession>;
    updateSyncSession(id: string, updates: Partial<SyncSession>): Promise<SyncSession | undefined>;
}
