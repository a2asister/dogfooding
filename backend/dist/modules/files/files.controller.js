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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_service_1 = require("./files.service");
const users_service_1 = require("../users/users.service");
let FilesController = class FilesController {
    constructor(filesService, usersService) {
        this.filesService = filesService;
        this.usersService = usersService;
    }
    async getCurrentUser(req) {
        const userId = req.session?.userId;
        if (!userId) {
            throw new common_1.NotFoundException('User not authenticated');
        }
        return this.usersService.findOne(userId);
    }
    async uploadFile(req, file, path = '/') {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const user = await this.getCurrentUser(req);
        const result = await this.filesService.uploadFile(user, file.buffer, file.originalname, path);
        return {
            success: true,
            data: result,
        };
    }
    async downloadFile(req, fileId, res) {
        const user = await this.getCurrentUser(req);
        const { buffer, filename, mimeType } = await this.filesService.downloadFile(user, fileId);
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.send(buffer);
    }
    async getFiles(req, path = '/') {
        const user = await this.getCurrentUser(req);
        const files = await this.filesService.getFiles(user, path);
        return {
            success: true,
            data: files,
        };
    }
    async searchFiles(req, query) {
        if (!query) {
            throw new common_1.BadRequestException('Search query is required');
        }
        const user = await this.getCurrentUser(req);
        const files = await this.filesService.searchFiles(user, query);
        return {
            success: true,
            data: files,
        };
    }
    async getSensitiveFiles(req) {
        const user = await this.getCurrentUser(req);
        const files = await this.filesService.getSensitiveFiles(user);
        return {
            success: true,
            data: files,
        };
    }
    async getStorageStats(req) {
        const user = await this.getCurrentUser(req);
        const stats = await this.filesService.getStorageStats(user);
        return {
            success: true,
            data: stats,
        };
    }
    async getFileById(req, fileId) {
        const user = await this.getCurrentUser(req);
        const file = await this.filesService.getFileById(user, fileId);
        return {
            success: true,
            data: file,
        };
    }
    async deleteFile(req, fileId) {
        const user = await this.getCurrentUser(req);
        const result = await this.filesService.deleteFile(user, fileId);
        return {
            success: true,
            data: { deleted: result },
        };
    }
    async renameFile(req, fileId, newName) {
        if (!newName) {
            throw new common_1.BadRequestException('New name is required');
        }
        const user = await this.getCurrentUser(req);
        const result = await this.filesService.renameFile(user, fileId, newName);
        return {
            success: true,
            data: result,
        };
    }
    async moveFile(req, fileId, newPath) {
        if (!newPath) {
            throw new common_1.BadRequestException('New path is required');
        }
        const user = await this.getCurrentUser(req);
        const result = await this.filesService.moveFile(user, fileId, newPath);
        return {
            success: true,
            data: result,
        };
    }
    async syncToLocal(req, fileId, localDir) {
        if (!localDir) {
            throw new common_1.BadRequestException('Local directory is required');
        }
        const user = await this.getCurrentUser(req);
        const result = await this.filesService.syncToLocal(user, fileId, localDir);
        return {
            success: true,
            data: result,
        };
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('download/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFiles", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "searchFiles", null);
__decorate([
    (0, common_1.Get)('sensitive'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getSensitiveFiles", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getStorageStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFileById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Put)(':id/rename'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "renameFile", null);
__decorate([
    (0, common_1.Put)(':id/move'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "moveFile", null);
__decorate([
    (0, common_1.Post)(':id/sync-local'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('localDir')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "syncToLocal", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [files_service_1.FilesService,
        users_service_1.UsersService])
], FilesController);
//# sourceMappingURL=files.controller.js.map