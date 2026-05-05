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
exports.InsurancePolicyController = void 0;
const common_1 = require("@nestjs/common");
const insurance_policy_service_1 = require("../services/insurance-policy.service");
let InsurancePolicyController = class InsurancePolicyController {
    constructor(insurancePolicyService) {
        this.insurancePolicyService = insurancePolicyService;
    }
    findAll(policyNumber) {
        if (policyNumber) {
            const policy = this.insurancePolicyService.findByPolicyNumber(policyNumber);
            return policy ? [policy] : [];
        }
        return this.insurancePolicyService.findAll();
    }
    findOne(id) {
        const policy = this.insurancePolicyService.findOne(id);
        if (!policy) {
            throw new common_1.HttpException('Insurance policy not found', common_1.HttpStatus.NOT_FOUND);
        }
        return policy;
    }
    create(policy) {
        return this.insurancePolicyService.create(policy);
    }
    update(id, policy) {
        const updatedPolicy = this.insurancePolicyService.update(id, policy);
        if (!updatedPolicy) {
            throw new common_1.HttpException('Insurance policy not found', common_1.HttpStatus.NOT_FOUND);
        }
        return updatedPolicy;
    }
    remove(id) {
        const success = this.insurancePolicyService.remove(id);
        if (!success) {
            throw new common_1.HttpException('Insurance policy not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
};
exports.InsurancePolicyController = InsurancePolicyController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('policyNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], InsurancePolicyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], InsurancePolicyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], InsurancePolicyController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Object)
], InsurancePolicyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], InsurancePolicyController.prototype, "remove", null);
exports.InsurancePolicyController = InsurancePolicyController = __decorate([
    (0, common_1.Controller)('insurance-policies'),
    __metadata("design:paramtypes", [insurance_policy_service_1.InsurancePolicyService])
], InsurancePolicyController);
//# sourceMappingURL=insurance-policy.controller.js.map