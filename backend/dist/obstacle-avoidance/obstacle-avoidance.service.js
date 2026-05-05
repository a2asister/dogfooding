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
exports.ObstacleAvoidanceService = void 0;
const common_1 = require("@nestjs/common");
const data_storage_service_1 = require("../data-storage/data-storage.service");
const path_planning_service_1 = require("../path-planning/path-planning.service");
let ObstacleAvoidanceService = class ObstacleAvoidanceService {
    constructor(dataStorageService, pathPlanningService) {
        this.dataStorageService = dataStorageService;
        this.pathPlanningService = pathPlanningService;
    }
    findAll() {
        return this.dataStorageService.getObstacles();
    }
    addObstacle(obstacle) {
        return this.dataStorageService.addObstacle(obstacle);
    }
    removeObstacle(id) {
        return this.dataStorageService.removeObstacle(id);
    }
    checkPathForObstacles(start, end, safetyMargin = 1) {
        const obstacles = this.dataStorageService.getObstacles();
        const path = this.pathPlanningService.planPath(start, end);
        const detectedObstacles = [];
        let isSafe = true;
        if (path.found && path.path.length > 0) {
            for (const pathPoint of path.path) {
                for (const obstacle of obstacles) {
                    const distance = this.getDistance(pathPoint, obstacle.position);
                    if (distance <= safetyMargin) {
                        if (!detectedObstacles.find(o => o.id === obstacle.id)) {
                            detectedObstacles.push(obstacle);
                            isSafe = false;
                        }
                    }
                }
            }
        }
        const safePath = isSafe
            ? path.path
            : this.findAlternativePath(start, end, obstacles, safetyMargin);
        return {
            obstacles: detectedObstacles,
            safePath,
            isSafe,
        };
    }
    findAlternativePath(start, end, obstacles, safetyMargin) {
        const additionalObstacles = [];
        for (const obstacle of obstacles) {
            for (let dx = -safetyMargin; dx <= safetyMargin; dx++) {
                for (let dy = -safetyMargin; dy <= safetyMargin; dy++) {
                    additionalObstacles.push({
                        x: obstacle.position.x + dx,
                        y: obstacle.position.y + dy,
                    });
                }
            }
        }
        const result = this.pathPlanningService.planPath(start, end, additionalObstacles);
        return result.found ? result.path : [];
    }
    getDistance(pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    }
    isPositionSafe(position, safetyMargin = 1) {
        const obstacles = this.dataStorageService.getObstacles();
        for (const obstacle of obstacles) {
            const distance = this.getDistance(position, obstacle.position);
            if (distance <= safetyMargin) {
                return false;
            }
        }
        return true;
    }
    getDynamicObstacles() {
        return this.dataStorageService
            .getObstacles()
            .filter(obstacle => obstacle.type === 'dynamic');
    }
    updateDynamicObstacles() {
        const obstacles = this.dataStorageService.getObstacles();
        const dynamicObstacles = obstacles.filter(o => o.type === 'dynamic');
        for (const obstacle of dynamicObstacles) {
            const dx = Math.random() > 0.5 ? 1 : -1;
            const dy = Math.random() > 0.5 ? 1 : -1;
            const newPosition = {
                x: Math.max(0, Math.min(19, obstacle.position.x + dx)),
                y: Math.max(0, Math.min(19, obstacle.position.y + dy)),
            };
            this.dataStorageService.removeObstacle(obstacle.id);
            this.dataStorageService.addObstacle({
                position: newPosition,
                type: 'dynamic',
                size: obstacle.size,
            });
        }
    }
};
exports.ObstacleAvoidanceService = ObstacleAvoidanceService;
exports.ObstacleAvoidanceService = ObstacleAvoidanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_storage_service_1.DataStorageService,
        path_planning_service_1.PathPlanningService])
], ObstacleAvoidanceService);
//# sourceMappingURL=obstacle-avoidance.service.js.map