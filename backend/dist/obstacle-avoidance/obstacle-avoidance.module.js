"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObstacleAvoidanceModule = void 0;
const common_1 = require("@nestjs/common");
const obstacle_avoidance_controller_1 = require("./obstacle-avoidance.controller");
const obstacle_avoidance_service_1 = require("./obstacle-avoidance.service");
const path_planning_module_1 = require("../path-planning/path-planning.module");
let ObstacleAvoidanceModule = class ObstacleAvoidanceModule {
};
exports.ObstacleAvoidanceModule = ObstacleAvoidanceModule;
exports.ObstacleAvoidanceModule = ObstacleAvoidanceModule = __decorate([
    (0, common_1.Module)({
        imports: [path_planning_module_1.PathPlanningModule],
        controllers: [obstacle_avoidance_controller_1.ObstacleAvoidanceController],
        providers: [obstacle_avoidance_service_1.ObstacleAvoidanceService],
        exports: [obstacle_avoidance_service_1.ObstacleAvoidanceService],
    })
], ObstacleAvoidanceModule);
//# sourceMappingURL=obstacle-avoidance.module.js.map