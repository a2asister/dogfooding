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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareController = void 0;
const common_1 = require("@nestjs/common");
const share_service_1 = require("./share.service");
const users_service_1 = require("../users/users.service");
let ShareController = class ShareController {
    constructor(shareService, usersService) {
        this.shareService = shareService;
        this.usersService = usersService;
    }
    async getCurrentUser(req) {
        const userId = req.session?.userId;
        if (!userId) {
            throw new common_1.NotFoundException('User not authenticated');
        }
        return this.usersService.findOne(userId);
    }
    async createShare(req, body) {
        const user = await this.getCurrentUser(req);
        if (!body.fileId || !body.sharedWithUsername || !body.permission) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        const share = await this.shareService.createShare(user, body.fileId, body.sharedWithUsername, body.permission, body.expiresInHours);
        return {
            success: true,
            data: share,
        };
    }
    async getMyShares(req) {
        const user = await this.getCurrentUser(req);
        const shares = await this.shareService.getSharesByOwner(user);
        return {
            success: true,
            data: shares,
        };
    }
    async getSharedWithMe(req) {
        const user = await this.getCurrentUser(req);
        const shares = await this.shareService.getSharesSharedWithUser(user);
        return {
            success: true,
            data: shares,
        };
    }
    async getShareById(shareId) {
        const share = await this.shareService.getShareById(shareId);
        return {
            success: true,
            data: share,
        };
    }
    async revokeShare(req, shareId) {
        const user = await this.getCurrentUser(req);
        const result = await this.shareService.revokeShare(user, shareId);
        return {
            success: true,
            data: { revoked: result },
        };
    }
    async updatePermission(req, shareId, permission) {
        if (!permission) {
            throw new common_1.BadRequestException('Permission is required');
        }
        const user = await this.getCurrentUser(req);
        const share = await this.shareService.updateSharePermission(user, shareId, permission);
        return {
            success: true,
            data: share,
        };
    }
    async checkPermission(req, body) {
        const user = await this.getCurrentUser(req);
        if (!body.fileId || !body.permission) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        const hasPermission = await this.shareService.checkPermission(user, body.fileId, body.permission);
        return {
            success: true,
            data: { hasPermission },
        };
    }
};
exports.ShareController = ShareController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "createShare", null);
__decorate([
    (0, common_1.Get)('my-shares'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getMyShares", null);
__decorate([
    (0, common_1.Get)('shared-with-me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getSharedWithMe", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "getShareById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "revokeShare", null);
__decorate([
    (0, common_1.Put)(':id/permission'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "updatePermission", null);
__decorate([
    (0, common_1.Post)('check'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ShareController.prototype, "checkPermission", null);
exports.ShareController = ShareController = __decorate([
    (0, common_1.Controller)('share'),
    __metadata("design:paramtypes", [share_service_1.ShareService,
        users_service_1.UsersService])
], ShareController);
//# sourceMappingURL=share.controller.js.map