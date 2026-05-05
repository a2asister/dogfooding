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
exports.InsuranceProductController = void 0;
const common_1 = require("@nestjs/common");
const insurance_product_service_1 = require("../services/insurance-product.service");
let InsuranceProductController = class InsuranceProductController {
    constructor(insuranceProductService) {
        this.insuranceProductService = insuranceProductService;
    }
    findAll() {
        return this.insuranceProductService.findAll();
    }
    findOne(id) {
        const product = this.insuranceProductService.findOne(id);
        if (!product) {
            throw new common_1.HttpException('Insurance product not found', common_1.HttpStatus.NOT_FOUND);
        }
        return product;
    }
    create(product) {
        return this.insuranceProductService.create(product);
    }
    update(id, product) {
        const updatedProduct = this.insuranceProductService.update(id, product);
        if (!updatedProduct) {
            throw new common_1.HttpException('Insurance product not found', common_1.HttpStatus.NOT_FOUND);
        }
        return updatedProduct;
    }
    remove(id) {
        const success = this.insuranceProductService.remove(id);
        if (!success) {
            throw new common_1.HttpException('Insurance product not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
};
exports.InsuranceProductController = InsuranceProductController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], InsuranceProductController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], InsuranceProductController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], InsuranceProductController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Object)
], InsuranceProductController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], InsuranceProductController.prototype, "remove", null);
exports.InsuranceProductController = InsuranceProductController = __decorate([
    (0, common_1.Controller)('insurance-products'),
    __metadata("design:paramtypes", [insurance_product_service_1.InsuranceProductService])
], InsuranceProductController);
//# sourceMappingURL=insurance-product.controller.js.map