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
exports.SyncController = void 0;
const common_1 = require("@nestjs/common");
const sync_service_1 = require("./sync.service");
const users_service_1 = require("../users/users.service");
let SyncController = class SyncController {
    constructor(syncService, usersService) {
        this.syncService = syncService;
        this.usersService = usersService;
    }
    async getCurrentUser(req) {
        const userId = req.session?.userId;
        if (!userId) {
            throw new common_1.NotFoundException('User not authenticated');
        }
        return this.usersService.findOne(userId);
    }
    async startSync(req, body) {
        const user = await this.getCurrentUser(req);
        const session = await this.syncService.startSyncSession(user, body.type, body.deviceId);
        return {
            success: true,
            data: session,
        };
    }
    async updateProgress(sessionId, body) {
        const result = await this.syncService.updateSyncProgress(sessionId, body.progress, body.filesSynced);
        if (!result) {
            throw new common_1.NotFoundException('Sync session not found');
        }
        return {
            success: true,
            data: result,
        };
    }
    async completeSync(sessionId, body) {
        const result = await this.syncService.completeSyncSession(sessionId, body.success);
        if (!result) {
            throw new common_1.NotFoundException('Sync session not found');
        }
        return {
            success: true,
            data: result,
        };
    }
    async getSyncStatus(sessionId) {
        const status = await this.syncService.getSyncStatus(sessionId);
        if (!status) {
            throw new common_1.NotFoundException('Sync session not found');
        }
        return {
            success: true,
            data: status,
        };
    }
    async getSyncHistory(req) {
        const user = await this.getCurrentUser(req);
        const history = await this.syncService.getUserSyncHistory(user.id);
        return {
            success: true,
            data: history,
        };
    }
    async getActiveSessions(req) {
        const user = await this.getCurrentUser(req);
        const sessions = await this.syncService.getActiveSyncSessions(user.id);
        return {
            success: true,
            data: sessions,
        };
    }
    async checkFileChanges(req) {
        const user = await this.getCurrentUser(req);
        const changes = await this.syncService.checkFileChanges(user);
        return {
            success: true,
            data: changes,
        };
    }
    async calculateDelta(req, body) {
        const user = await this.getCurrentUser(req);
        const cloudFiles = [];
        const delta = await this.syncService.calculateSyncDelta(body.localFiles, cloudFiles);
        return {
            success: true,
            data: delta,
        };
    }
};
exports.SyncController = SyncController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "startSync", null);
__decorate([
    (0, common_1.Put)(':id/progress'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Put)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "completeSync", null);
__decorate([
    (0, common_1.Get)('status/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "getSyncStatus", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "getSyncHistory", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "getActiveSessions", null);
__decorate([
    (0, common_1.Get)('changes'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "checkFileChanges", null);
__decorate([
    (0, common_1.Post)('delta'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "calculateDelta", null);
exports.SyncController = SyncController = __decorate([
    (0, common_1.Controller)('sync'),
    __metadata("design:paramtypes", [sync_service_1.SyncService,
        users_service_1.UsersService])
], SyncController);
//# sourceMappingURL=sync.controller.js.map