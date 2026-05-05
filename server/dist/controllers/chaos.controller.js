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
exports.ChaosController = void 0;
const common_1 = require("@nestjs/common");
const json_database_service_1 = require("../services/json-database.service");
const chaos_monkey_service_1 = require("../services/chaos-monkey.service");
const types_1 = require("../types");
let ChaosController = class ChaosController {
    constructor(dbService, chaosService) {
        this.dbService = dbService;
        this.chaosService = chaosService;
    }
    async getAllExperiments() {
        return this.chaosService.getAllExperiments();
    }
    async getExperiment(id) {
        const experiment = await this.chaosService.getExperimentById(id);
        if (!experiment) {
            throw new common_1.HttpException('Experiment not found', common_1.HttpStatus.NOT_FOUND);
        }
        return experiment;
    }
    async createExperiment(body) {
        if (!body.name || !body.type) {
            throw new common_1.HttpException('Name and type are required', common_1.HttpStatus.BAD_REQUEST);
        }
        const validTypes = Object.values(types_1.ChaosType);
        if (!validTypes.includes(body.type)) {
            throw new common_1.HttpException(`Invalid type. Valid types: ${validTypes.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
        }
        const newExperiment = await this.dbService.createChaosExperiment({
            name: body.name,
            description: body.description || '',
            type: body.type,
            targetEndpoint: body.targetEndpoint || '*',
            targetMethod: body.targetMethod || '*',
            intensity: body.intensity ?? 50,
            duration: body.duration ?? 60000,
            probability: body.probability ?? 0.5,
        });
        return newExperiment;
    }
    async updateExperiment(id, body) {
        const updated = await this.dbService.updateChaosExperiment(id, body);
        if (!updated) {
            throw new common_1.HttpException('Experiment not found', common_1.HttpStatus.NOT_FOUND);
        }
        return updated;
    }
    async deleteExperiment(id) {
        const experiment = await this.chaosService.getExperimentById(id);
        if (experiment && experiment.status === 'running') {
            await this.chaosService.stopExperiment(id);
        }
        const deleted = await this.dbService.deleteChaosExperiment(id);
        if (!deleted) {
            throw new common_1.HttpException('Experiment not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
    async startExperiment(id) {
        const experiment = await this.chaosService.getExperimentById(id);
        if (!experiment) {
            throw new common_1.HttpException('Experiment not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (experiment.status === 'running') {
            return { success: true, message: 'Experiment is already running', experiment };
        }
        const started = await this.chaosService.startExperiment(id);
        if (!started) {
            throw new common_1.HttpException('Failed to start experiment', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return { success: true, experiment: started };
    }
    async stopExperiment(id) {
        const stopped = await this.chaosService.stopExperiment(id);
        if (!stopped) {
            throw new common_1.HttpException('Experiment not found or not running', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true, experiment: stopped };
    }
    async pauseExperiment(id) {
        const experiment = await this.chaosService.getExperimentById(id);
        if (!experiment) {
            throw new common_1.HttpException('Experiment not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (experiment.status !== 'running') {
            throw new common_1.HttpException('Experiment is not running', common_1.HttpStatus.BAD_REQUEST);
        }
        const paused = await this.chaosService.pauseExperiment(id);
        if (!paused) {
            throw new common_1.HttpException('Failed to pause experiment', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return { success: true, experiment: paused };
    }
    async resumeExperiment(id) {
        const experiment = await this.chaosService.getExperimentById(id);
        if (!experiment) {
            throw new common_1.HttpException('Experiment not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (experiment.status !== 'paused') {
            throw new common_1.HttpException('Experiment is not paused', common_1.HttpStatus.BAD_REQUEST);
        }
        const resumed = await this.chaosService.resumeExperiment(id);
        if (!resumed) {
            throw new common_1.HttpException('Failed to resume experiment', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return { success: true, experiment: resumed };
    }
    async getActiveExperiments() {
        return this.chaosService.getActiveExperiments();
    }
    getChaosTypes() {
        return Object.values(types_1.ChaosType);
    }
};
exports.ChaosController = ChaosController;
__decorate([
    (0, common_1.Get)('experiments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChaosController.prototype, "getAllExperiments", null);
__decorate([
    (0, common_1.Get)('experiments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChaosController.prototype, "getExperiment", null);
__decorate([
    (0, common_1.Post)('experiments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChaosController.prototype, "createExperiment", null);
__decorate([
    (0, common_1.Put)('experiments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChaosController.prototype, "updateExperiment", null);
__decorate([
    (0, common_1.Delete)('experiments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChaosController.prototype, "deleteExperiment", null);
__decorate([
    (0, common_1.Post)('experiments/:id/start'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChaosController.prototype, "startExperiment", null);
__decorate([
    (0, common_1.Post)('experiments/:id/stop'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChaosController.prototype, "stopExperiment", null);
__decorate([
    (0, common_1.Post)('experiments/:id/pause'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChaosController.prototype, "pauseExperiment", null);
__decorate([
    (0, common_1.Post)('experiments/:id/resume'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChaosController.prototype, "resumeExperiment", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChaosController.prototype, "getActiveExperiments", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChaosController.prototype, "getChaosTypes", null);
exports.ChaosController = ChaosController = __decorate([
    (0, common_1.Controller)('chaos'),
    __metadata("design:paramtypes", [json_database_service_1.JsonDatabaseService,
        chaos_monkey_service_1.ChaosMonkeyService])
], ChaosController);
//# sourceMappingURL=chaos.controller.js.map