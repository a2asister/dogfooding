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
exports.RobotsController = void 0;
const common_1 = require("@nestjs/common");
const robots_service_1 = require("./robots.service");
const create_robot_dto_1 = require("./dto/create-robot.dto");
let RobotsController = class RobotsController {
    constructor(robotsService) {
        this.robotsService = robotsService;
    }
    findAll() {
        return this.robotsService.findAll();
    }
    getAvailableRobots() {
        return this.robotsService.getAvailableRobots();
    }
    findOne(id) {
        return this.robotsService.findOne(id);
    }
    create(createRobotDto) {
        return this.robotsService.create(createRobotDto);
    }
    update(id, updateRobotDto) {
        return this.robotsService.update(id, updateRobotDto);
    }
    remove(id) {
        this.robotsService.remove(id);
    }
    moveRobot(id) {
        return this.robotsService.moveRobot(id);
    }
};
exports.RobotsController = RobotsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], RobotsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('available'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], RobotsController.prototype, "getAvailableRobots", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], RobotsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_robot_dto_1.CreateRobotDto]),
    __metadata("design:returntype", Object)
], RobotsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_robot_dto_1.UpdateRobotDto]),
    __metadata("design:returntype", Object)
], RobotsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RobotsController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/move'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], RobotsController.prototype, "moveRobot", null);
exports.RobotsController = RobotsController = __decorate([
    (0, common_1.Controller)('api/robots'),
    __metadata("design:paramtypes", [robots_service_1.RobotsService])
], RobotsController);
//# sourceMappingURL=robots.controller.js.map