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
exports.ClaimApplicationController = void 0;
const common_1 = require("@nestjs/common");
const claim_application_service_1 = require("../services/claim-application.service");
let ClaimApplicationController = class ClaimApplicationController {
    constructor(claimApplicationService) {
        this.claimApplicationService = claimApplicationService;
    }
    findAll(policyId) {
        if (policyId) {
            return this.claimApplicationService.findByPolicyId(policyId);
        }
        return this.claimApplicationService.findAll();
    }
    findOne(id) {
        const claim = this.claimApplicationService.findOne(id);
        if (!claim) {
            throw new common_1.HttpException('Claim application not found', common_1.HttpStatus.NOT_FOUND);
        }
        return claim;
    }
    create(claim) {
        return this.claimApplicationService.create(claim);
    }
    update(id, claim) {
        const updatedClaim = this.claimApplicationService.update(id, claim);
        if (!updatedClaim) {
            throw new common_1.HttpException('Claim application not found', common_1.HttpStatus.NOT_FOUND);
        }
        return updatedClaim;
    }
    remove(id) {
        const success = this.claimApplicationService.remove(id);
        if (!success) {
            throw new common_1.HttpException('Claim application not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
};
exports.ClaimApplicationController = ClaimApplicationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('policyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], ClaimApplicationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], ClaimApplicationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], ClaimApplicationController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Object)
], ClaimApplicationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], ClaimApplicationController.prototype, "remove", null);
exports.ClaimApplicationController = ClaimApplicationController = __decorate([
    (0, common_1.Controller)('claim-applications'),
    __metadata("design:paramtypes", [claim_application_service_1.ClaimApplicationService])
], ClaimApplicationController);
//# sourceMappingURL=claim-application.controller.js.map