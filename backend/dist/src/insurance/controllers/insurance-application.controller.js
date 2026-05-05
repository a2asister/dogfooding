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
exports.InsuranceApplicationController = void 0;
const common_1 = require("@nestjs/common");
const insurance_application_service_1 = require("../services/insurance-application.service");
let InsuranceApplicationController = class InsuranceApplicationController {
    constructor(insuranceApplicationService) {
        this.insuranceApplicationService = insuranceApplicationService;
    }
    findAll() {
        return this.insuranceApplicationService.findAll();
    }
    findOne(id) {
        const application = this.insuranceApplicationService.findOne(id);
        if (!application) {
            throw new common_1.HttpException('Insurance application not found', common_1.HttpStatus.NOT_FOUND);
        }
        return application;
    }
    create(application) {
        return this.insuranceApplicationService.create(application);
    }
    update(id, application) {
        const updatedApplication = this.insuranceApplicationService.update(id, application);
        if (!updatedApplication) {
            throw new common_1.HttpException('Insurance application not found', common_1.HttpStatus.NOT_FOUND);
        }
        return updatedApplication;
    }
    remove(id) {
        const success = this.insuranceApplicationService.remove(id);
        if (!success) {
            throw new common_1.HttpException('Insurance application not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
};
exports.InsuranceApplicationController = InsuranceApplicationController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], InsuranceApplicationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], InsuranceApplicationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], InsuranceApplicationController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Object)
], InsuranceApplicationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], InsuranceApplicationController.prototype, "remove", null);
exports.InsuranceApplicationController = InsuranceApplicationController = __decorate([
    (0, common_1.Controller)('insurance-applications'),
    __metadata("design:paramtypes", [insurance_application_service_1.InsuranceApplicationService])
], InsuranceApplicationController);
//# sourceMappingURL=insurance-application.controller.js.map