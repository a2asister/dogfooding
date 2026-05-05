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
exports.UnderwritingRecordController = void 0;
const common_1 = require("@nestjs/common");
const underwriting_record_service_1 = require("../services/underwriting-record.service");
let UnderwritingRecordController = class UnderwritingRecordController {
    constructor(underwritingRecordService) {
        this.underwritingRecordService = underwritingRecordService;
    }
    findAll(applicationId) {
        if (applicationId) {
            return this.underwritingRecordService.findByApplicationId(applicationId);
        }
        return this.underwritingRecordService.findAll();
    }
    findOne(id) {
        const record = this.underwritingRecordService.findOne(id);
        if (!record) {
            throw new common_1.HttpException('Underwriting record not found', common_1.HttpStatus.NOT_FOUND);
        }
        return record;
    }
    create(record) {
        return this.underwritingRecordService.create(record);
    }
    update(id, record) {
        const updatedRecord = this.underwritingRecordService.update(id, record);
        if (!updatedRecord) {
            throw new common_1.HttpException('Underwriting record not found', common_1.HttpStatus.NOT_FOUND);
        }
        return updatedRecord;
    }
    remove(id) {
        const success = this.underwritingRecordService.remove(id);
        if (!success) {
            throw new common_1.HttpException('Underwriting record not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
};
exports.UnderwritingRecordController = UnderwritingRecordController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], UnderwritingRecordController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], UnderwritingRecordController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], UnderwritingRecordController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Object)
], UnderwritingRecordController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], UnderwritingRecordController.prototype, "remove", null);
exports.UnderwritingRecordController = UnderwritingRecordController = __decorate([
    (0, common_1.Controller)('underwriting-records'),
    __metadata("design:paramtypes", [underwriting_record_service_1.UnderwritingRecordService])
], UnderwritingRecordController);
//# sourceMappingURL=underwriting-record.controller.js.map