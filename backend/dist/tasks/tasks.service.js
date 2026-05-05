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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const data_storage_service_1 = require("../data-storage/data-storage.service");
const robots_service_1 = require("../robots/robots.service");
let TasksService = class TasksService {
    constructor(dataStorageService, robotsService) {
        this.dataStorageService = dataStorageService;
        this.robotsService = robotsService;
    }
    findAll() {
        return this.dataStorageService.getTasks();
    }
    findOne(id) {
        const task = this.dataStorageService.getTaskById(id);
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }
    create(createTaskDto) {
        return this.dataStorageService.createTask({
            name: createTaskDto.name,
            description: createTaskDto.description || '',
            priority: createTaskDto.priority || 'medium',
            status: 'pending',
            startPosition: createTaskDto.startPosition,
            targetPosition: createTaskDto.targetPosition,
            estimatedTime: createTaskDto.estimatedTime,
        });
    }
    update(id, updateTaskDto) {
        const task = this.dataStorageService.updateTask(id, updateTaskDto);
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }
    remove(id) {
        const success = this.dataStorageService.deleteTask(id);
        if (!success) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
    }
    async assignTask(taskId) {
        const task = this.findOne(taskId);
        if (task.status !== 'pending') {
            throw new common_1.BadRequestException('Task is not in pending status');
        }
        const availableRobots = this.robotsService.getAvailableRobots();
        if (availableRobots.length === 0) {
            throw new common_1.BadRequestException('No available robots');
        }
        const bestRobot = this.findBestRobotForTask(availableRobots, task);
        this.robotsService.update(bestRobot.id, {
            status: 'working',
            currentTaskId: task.id,
        });
        return this.dataStorageService.updateTask(taskId, {
            status: 'assigned',
            assignedRobotId: bestRobot.id,
        });
    }
    findBestRobotForTask(robots, task) {
        let bestRobot = robots[0];
        let bestScore = this.calculateRobotScore(bestRobot, task);
        for (const robot of robots.slice(1)) {
            const score = this.calculateRobotScore(robot, task);
            if (score > bestScore) {
                bestScore = score;
                bestRobot = robot;
            }
        }
        return bestRobot;
    }
    calculateRobotScore(robot, task) {
        const distanceToStart = this.calculateDistance(robot.position, task.startPosition);
        const batteryScore = robot.batteryLevel / 100;
        const speedScore = robot.speed;
        return (100 - distanceToStart) * 0.5 + batteryScore * 30 + speedScore * 20;
    }
    calculateDistance(pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    }
    startTask(taskId) {
        const task = this.findOne(taskId);
        if (task.status !== 'assigned') {
            throw new common_1.BadRequestException('Task is not assigned');
        }
        return this.dataStorageService.updateTask(taskId, {
            status: 'in_progress',
        });
    }
    completeTask(taskId) {
        const task = this.findOne(taskId);
        if (task.status !== 'in_progress') {
            throw new common_1.BadRequestException('Task is not in progress');
        }
        if (task.assignedRobotId) {
            this.robotsService.update(task.assignedRobotId, {
                status: 'idle',
                currentTaskId: undefined,
            });
        }
        return this.dataStorageService.updateTask(taskId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
        });
    }
    cancelTask(taskId) {
        const task = this.findOne(taskId);
        if (task.assignedRobotId) {
            this.robotsService.update(task.assignedRobotId, {
                status: 'idle',
                currentTaskId: undefined,
            });
        }
        return this.dataStorageService.updateTask(taskId, {
            status: 'cancelled',
            assignedRobotId: undefined,
        });
    }
    getTasksByStatus(status) {
        return this.dataStorageService.getTasks().filter(task => task.status === status);
    }
    getTasksByRobot(robotId) {
        return this.dataStorageService.getTasks().filter(task => task.assignedRobotId === robotId);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_storage_service_1.DataStorageService,
        robots_service_1.RobotsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map