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
exports.ActuarialController = void 0;
const common_1 = require("@nestjs/common");
const actuarial_service_1 = require("../services/actuarial.service");
let ActuarialController = class ActuarialController {
    constructor(actuarialService) {
        this.actuarialService = actuarialService;
    }
    findAll(productId) {
        if (productId) {
            return this.actuarialService.findByProductId(productId);
        }
        return this.actuarialService.findAll();
    }
    findOne(id) {
        const data = this.actuarialService.findOne(id);
        if (!data) {
            throw new common_1.HttpException('Actuarial data not found', common_1.HttpStatus.NOT_FOUND);
        }
        return data;
    }
    create(data) {
        return this.actuarialService.create(data);
    }
    update(id, data) {
        const updatedData = this.actuarialService.update(id, data);
        if (!updatedData) {
            throw new common_1.HttpException('Actuarial data not found', common_1.HttpStatus.NOT_FOUND);
        }
        return updatedData;
    }
    remove(id) {
        const success = this.actuarialService.remove(id);
        if (!success) {
            throw new common_1.HttpException('Actuarial data not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
};
exports.ActuarialController = ActuarialController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], ActuarialController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], ActuarialController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], ActuarialController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Object)
], ActuarialController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], ActuarialController.prototype, "remove", null);
exports.ActuarialController = ActuarialController = __decorate([
    (0, common_1.Controller)('actuarial-data'),
    __metadata("design:paramtypes", [actuarial_service_1.ActuarialService])
], ActuarialController);
//# sourceMappingURL=actuarial.controller.js.map