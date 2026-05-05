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
exports.RobotsService = void 0;
const common_1 = require("@nestjs/common");
const data_storage_service_1 = require("../data-storage/data-storage.service");
let RobotsService = class RobotsService {
    constructor(dataStorageService) {
        this.dataStorageService = dataStorageService;
    }
    findAll() {
        return this.dataStorageService.getRobots();
    }
    findOne(id) {
        const robot = this.dataStorageService.getRobotById(id);
        if (!robot) {
            throw new common_1.NotFoundException(`Robot with ID ${id} not found`);
        }
        return robot;
    }
    create(createRobotDto) {
        return this.dataStorageService.createRobot({
            name: createRobotDto.name,
            status: createRobotDto.status || 'idle',
            position: createRobotDto.position || { x: 0, y: 0 },
            batteryLevel: createRobotDto.batteryLevel || 100,
            speed: createRobotDto.speed || 1.0,
        });
    }
    update(id, updateRobotDto) {
        const robot = this.dataStorageService.updateRobot(id, updateRobotDto);
        if (!robot) {
            throw new common_1.NotFoundException(`Robot with ID ${id} not found`);
        }
        return robot;
    }
    remove(id) {
        const success = this.dataStorageService.deleteRobot(id);
        if (!success) {
            throw new common_1.NotFoundException(`Robot with ID ${id} not found`);
        }
    }
    getAvailableRobots() {
        return this.dataStorageService.getRobots().filter(robot => robot.status === 'idle' && robot.batteryLevel > 20);
    }
    updateRobotPath(robotId, path) {
        const robot = this.dataStorageService.updateRobot(robotId, {
            path,
            currentPathIndex: 0,
        });
        if (!robot) {
            throw new common_1.NotFoundException(`Robot with ID ${robotId} not found`);
        }
        return robot;
    }
    moveRobot(robotId) {
        const robot = this.findOne(robotId);
        if (!robot.path || robot.path.length === 0) {
            return robot;
        }
        if (robot.currentPathIndex === undefined || robot.currentPathIndex >= robot.path.length) {
            return this.dataStorageService.updateRobot(robotId, {
                status: 'idle',
                path: undefined,
                currentPathIndex: undefined,
            });
        }
        const nextPosition = robot.path[robot.currentPathIndex];
        const batteryDrain = 0.5;
        return this.dataStorageService.updateRobot(robotId, {
            position: nextPosition,
            currentPathIndex: robot.currentPathIndex + 1,
            batteryLevel: Math.max(0, robot.batteryLevel - batteryDrain),
            status: 'moving',
        });
    }
};
exports.RobotsService = RobotsService;
exports.RobotsService = RobotsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_storage_service_1.DataStorageService])
], RobotsService);
//# sourceMappingURL=robots.service.js.map