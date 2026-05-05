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
exports.InsuredPersonController = void 0;
const common_1 = require("@nestjs/common");
const insured_person_service_1 = require("../services/insured-person.service");
let InsuredPersonController = class InsuredPersonController {
    constructor(insuredPersonService) {
        this.insuredPersonService = insuredPersonService;
    }
    findAll() {
        return this.insuredPersonService.findAll();
    }
    findOne(id) {
        const person = this.insuredPersonService.findOne(id);
        if (!person) {
            throw new common_1.HttpException('Insured person not found', common_1.HttpStatus.NOT_FOUND);
        }
        return person;
    }
    create(person) {
        return this.insuredPersonService.create(person);
    }
    update(id, person) {
        const updatedPerson = this.insuredPersonService.update(id, person);
        if (!updatedPerson) {
            throw new common_1.HttpException('Insured person not found', common_1.HttpStatus.NOT_FOUND);
        }
        return updatedPerson;
    }
    remove(id) {
        const success = this.insuredPersonService.remove(id);
        if (!success) {
            throw new common_1.HttpException('Insured person not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
};
exports.InsuredPersonController = InsuredPersonController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], InsuredPersonController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], InsuredPersonController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], InsuredPersonController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Object)
], InsuredPersonController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], InsuredPersonController.prototype, "remove", null);
exports.InsuredPersonController = InsuredPersonController = __decorate([
    (0, common_1.Controller)('insured-persons'),
    __metadata("design:paramtypes", [insured_person_service_1.InsuredPersonService])
], InsuredPersonController);
//# sourceMappingURL=insured-person.controller.js.map