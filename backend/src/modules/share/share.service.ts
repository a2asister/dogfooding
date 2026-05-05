import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService, ShareLink, User, FileRecord } from '../database/database.service';

@Injectable()
export class ShareService {
  constructor(private databaseService: DatabaseService) {}

  async createShare(
    owner: User,
    fileId: string,
    sharedWithUsername: string,
    permission: 'read' | 'write' | 'readwrite',
    expiresInHours?: number,
  ): Promise<ShareLink> {
    const file = await this.databaseService.getFileById(fileId);
    if (!file || file.deleted) {
      throw new NotFoundException('File not found');
    }
    if (file.ownerId !== owner.id) {
      throw new ForbiddenException('You do not have permission to share this file');
    }

    const sharedWithUser = await this.databaseService.getUserByUsername(sharedWithUsername);
    if (!sharedWithUser) {
      throw new NotFoundException('User to share with not found');
    }

    if (sharedWithUser.id === owner.id) {
      throw new BadRequestException('Cannot share file with yourself');
    }

    const existingShares = await this.databaseService.getSharesByFile(fileId);
    const existingShare = existingShares.find((s) => s.sharedWithUserId === sharedWithUser.id);
    if (existingShare && existingShare.isActive) {
      throw new BadRequestException('File is already shared with this user');
    }

    const expiresAt = expiresInHours
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
      : '';

    const shareLink: ShareLink = {
      id: uuidv4(),
      fileId,
      ownerId: owner.id,
      sharedWithUserId: sharedWithUser.id,
      permission,
      expiresAt,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    return this.databaseService.createShare(shareLink);
  }

  async getShareById(shareId: string): Promise<ShareLink> {
    const shares = await this.databaseService.getShares();
    const share = shares.find((s) => s.id === shareId);
    if (!share) {
      throw new NotFoundException('Share link not found');
    }
    return share;
  }

  async getSharesByOwner(owner: User): Promise<(ShareLink & { file: FileRecord; sharedWith: { id: string; username: string } })[]> {
    const shares = await this.databaseService.getShares();
    const ownerShares = shares.filter((s) => s.ownerId === owner.id);
    
    const result = [];
    for (const share of ownerShares) {
      const file = await this.databaseService.getFileById(share.fileId);
      const sharedWithUser = await this.databaseService.getUserById(share.sharedWithUserId);
      if (file && sharedWithUser) {
        result.push({
          ...share,
          file,
          sharedWith: {
            id: sharedWithUser.id,
            username: sharedWithUser.username,
          },
        });
      }
    }

    return result;
  }

  async getSharesSharedWithUser(user: User): Promise<(ShareLink & { file: FileRecord; owner: { id: string; username: string } })[]> {
    const shares = await this.databaseService.getSharesByUser(user.id);
    const activeShares = shares.filter((s) => {
      if (!s.isActive) return false;
      if (s.expiresAt) {
        return new Date(s.expiresAt) > new Date();
      }
      return true;
    });

    const result = [];
    for (const share of activeShares) {
      const file = await this.databaseService.getFileById(share.fileId);
      const owner = await this.databaseService.getUserById(share.ownerId);
      if (file && owner) {
        result.push({
          ...share,
          file,
          owner: {
            id: owner.id,
            username: owner.username,
          },
        });
      }
    }

    return result;
  }

  async revokeShare(owner: User, shareId: string): Promise<boolean> {
    const share = await this.getShareById(shareId);
    if (share.ownerId !== owner.id) {
      throw new ForbiddenException('You do not have permission to revoke this share');
    }

    const result = await this.databaseService.updateShare(shareId, {
      isActive: false,
    });

    return !!result;
  }

  async updateSharePermission(
    owner: User,
    shareId: string,
    permission: 'read' | 'write' | 'readwrite',
  ): Promise<ShareLink> {
    const share = await this.getShareById(shareId);
    if (share.ownerId !== owner.id) {
      throw new ForbiddenException('You do not have permission to update this share');
    }

    const result = await this.databaseService.updateShare(shareId, {
      permission,
    });

    if (!result) {
      throw new NotFoundException('Share not found');
    }

    return result;
  }

  async checkPermission(
    user: User,
    fileId: string,
    requiredPermission: 'read' | 'write' | 'readwrite',
  ): Promise<boolean> {
    const file = await this.databaseService.getFileById(fileId);
    if (!file) {
      return false;
    }

    if (file.ownerId === user.id) {
      return true;
    }

    const shares = await this.databaseService.getSharesByFile(fileId);
    const activeShare = shares.find(
      (s) => s.sharedWithUserId === user.id && s.isActive,
    );

    if (!activeShare) {
      return false;
    }

    if (activeShare.expiresAt && new Date(activeShare.expiresAt) <= new Date()) {
      return false;
    }

    const permissionLevels = {
      read: 1,
      write: 2,
      readwrite: 3,
    };

    const userLevel = permissionLevels[activeShare.permission];
    const requiredLevel = permissionLevels[requiredPermission];

    return userLevel >= requiredLevel;
  }
}
