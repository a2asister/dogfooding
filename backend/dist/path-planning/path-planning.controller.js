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
exports.PathPlanningController = void 0;
const common_1 = require("@nestjs/common");
const path_planning_service_1 = require("./path-planning.service");
const plan_path_dto_1 = require("./dto/plan-path.dto");
let PathPlanningController = class PathPlanningController {
    constructor(pathPlanningService) {
        this.pathPlanningService = pathPlanningService;
    }
    planPath(planPathDto) {
        return this.pathPlanningService.planPath(planPathDto.start, planPathDto.end, planPathDto.obstacles);
    }
    getMapGrid() {
        return this.pathPlanningService.getMapGrid();
    }
};
exports.PathPlanningController = PathPlanningController;
__decorate([
    (0, common_1.Post)('plan'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [plan_path_dto_1.PlanPathDto]),
    __metadata("design:returntype", Object)
], PathPlanningController.prototype, "planPath", null);
__decorate([
    (0, common_1.Get)('map'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PathPlanningController.prototype, "getMapGrid", null);
exports.PathPlanningController = PathPlanningController = __decorate([
    (0, common_1.Controller)('api/path-planning'),
    __metadata("design:paramtypes", [path_planning_service_1.PathPlanningService])
], PathPlanningController);
//# sourceMappingURL=path-planning.controller.js.map