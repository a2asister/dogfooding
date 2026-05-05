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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckObstacleDto = exports.CreateObstacleDto = void 0;
const class_validator_1 = require("class-validator");
class CreateObstacleDto {
    constructor() {
        this.type = 'static';
        this.size = 1;
    }
}
exports.CreateObstacleDto = CreateObstacleDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateObstacleDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateObstacleDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateObstacleDto.prototype, "size", void 0);
class CheckObstacleDto {
    constructor() {
        this.safetyMargin = 1;
    }
}
exports.CheckObstacleDto = CheckObstacleDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CheckObstacleDto.prototype, "start", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CheckObstacleDto.prototype, "end", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CheckObstacleDto.prototype, "safetyMargin", void 0);
//# sourceMappingURL=create-obstacle.dto.js.map