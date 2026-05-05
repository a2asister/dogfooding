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
exports.ShareService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const database_service_1 = require("../database/database.service");
let ShareService = class ShareService {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async createShare(owner, fileId, sharedWithUsername, permission, expiresInHours) {
        const file = await this.databaseService.getFileById(fileId);
        if (!file || file.deleted) {
            throw new common_1.NotFoundException('File not found');
        }
        if (file.ownerId !== owner.id) {
            throw new common_1.ForbiddenException('You do not have permission to share this file');
        }
        const sharedWithUser = await this.databaseService.getUserByUsername(sharedWithUsername);
        if (!sharedWithUser) {
            throw new common_1.NotFoundException('User to share with not found');
        }
        if (sharedWithUser.id === owner.id) {
            throw new common_1.BadRequestException('Cannot share file with yourself');
        }
        const existingShares = await this.databaseService.getSharesByFile(fileId);
        const existingShare = existingShares.find((s) => s.sharedWithUserId === sharedWithUser.id);
        if (existingShare && existingShare.isActive) {
            throw new common_1.BadRequestException('File is already shared with this user');
        }
        const expiresAt = expiresInHours
            ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
            : '';
        const shareLink = {
            id: (0, uuid_1.v4)(),
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
    async getShareById(shareId) {
        const shares = await this.databaseService.getShares();
        const share = shares.find((s) => s.id === shareId);
        if (!share) {
            throw new common_1.NotFoundException('Share link not found');
        }
        return share;
    }
    async getSharesByOwner(owner) {
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
    async getSharesSharedWithUser(user) {
        const shares = await this.databaseService.getSharesByUser(user.id);
        const activeShares = shares.filter((s) => {
            if (!s.isActive)
                return false;
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
    async revokeShare(owner, shareId) {
        const share = await this.getShareById(shareId);
        if (share.ownerId !== owner.id) {
            throw new common_1.ForbiddenException('You do not have permission to revoke this share');
        }
        const result = await this.databaseService.updateShare(shareId, {
            isActive: false,
        });
        return !!result;
    }
    async updateSharePermission(owner, shareId, permission) {
        const share = await this.getShareById(shareId);
        if (share.ownerId !== owner.id) {
            throw new common_1.ForbiddenException('You do not have permission to update this share');
        }
        const result = await this.databaseService.updateShare(shareId, {
            permission,
        });
        if (!result) {
            throw new common_1.NotFoundException('Share not found');
        }
        return result;
    }
    async checkPermission(user, fileId, requiredPermission) {
        const file = await this.databaseService.getFileById(fileId);
        if (!file) {
            return false;
        }
        if (file.ownerId === user.id) {
            return true;
        }
        const shares = await this.databaseService.getSharesByFile(fileId);
        const activeShare = shares.find((s) => s.sharedWithUserId === user.id && s.isActive);
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
};
exports.ShareService = ShareService;
exports.ShareService = ShareService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ShareService);
//# sourceMappingURL=share.service.js.map