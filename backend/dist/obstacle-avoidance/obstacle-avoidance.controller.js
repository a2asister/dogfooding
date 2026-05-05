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
exports.ObstacleAvoidanceController = void 0;
const common_1 = require("@nestjs/common");
const obstacle_avoidance_service_1 = require("./obstacle-avoidance.service");
const create_obstacle_dto_1 = require("./dto/create-obstacle.dto");
let ObstacleAvoidanceController = class ObstacleAvoidanceController {
    constructor(obstacleAvoidanceService) {
        this.obstacleAvoidanceService = obstacleAvoidanceService;
    }
    findAll() {
        return this.obstacleAvoidanceService.findAll();
    }
    getDynamicObstacles() {
        return this.obstacleAvoidanceService.getDynamicObstacles();
    }
    addObstacle(createObstacleDto) {
        return this.obstacleAvoidanceService.addObstacle({
            position: createObstacleDto.position,
            type: createObstacleDto.type || 'static',
            size: createObstacleDto.size || 1,
        });
    }
    removeObstacle(id) {
        this.obstacleAvoidanceService.removeObstacle(id);
    }
    checkPathForObstacles(checkObstacleDto) {
        return this.obstacleAvoidanceService.checkPathForObstacles(checkObstacleDto.start, checkObstacleDto.end, checkObstacleDto.safetyMargin);
    }
    updateDynamicObstacles() {
        this.obstacleAvoidanceService.updateDynamicObstacles();
    }
};
exports.ObstacleAvoidanceController = ObstacleAvoidanceController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], ObstacleAvoidanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dynamic'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], ObstacleAvoidanceController.prototype, "getDynamicObstacles", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_obstacle_dto_1.CreateObstacleDto]),
    __metadata("design:returntype", Object)
], ObstacleAvoidanceController.prototype, "addObstacle", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ObstacleAvoidanceController.prototype, "removeObstacle", null);
__decorate([
    (0, common_1.Post)('check'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_obstacle_dto_1.CheckObstacleDto]),
    __metadata("design:returntype", Object)
], ObstacleAvoidanceController.prototype, "checkPathForObstacles", null);
__decorate([
    (0, common_1.Post)('update-dynamic'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ObstacleAvoidanceController.prototype, "updateDynamicObstacles", null);
exports.ObstacleAvoidanceController = ObstacleAvoidanceController = __decorate([
    (0, common_1.Controller)('api/obstacles'),
    __metadata("design:paramtypes", [obstacle_avoidance_service_1.ObstacleAvoidanceService])
], ObstacleAvoidanceController);
//# sourceMappingURL=obstacle-avoidance.controller.js.map