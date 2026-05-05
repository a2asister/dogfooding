"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const robots_module_1 = require("./robots/robots.module");
const tasks_module_1 = require("./tasks/tasks.module");
const path_planning_module_1 = require("./path-planning/path-planning.module");
const obstacle_avoidance_module_1 = require("./obstacle-avoidance/obstacle-avoidance.module");
const data_storage_module_1 = require("./data-storage/data-storage.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            data_storage_module_1.DataStorageModule,
            robots_module_1.RobotsModule,
            tasks_module_1.TasksModule,
            path_planning_module_1.PathPlanningModule,
            obstacle_avoidance_module_1.ObstacleAvoidanceModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map