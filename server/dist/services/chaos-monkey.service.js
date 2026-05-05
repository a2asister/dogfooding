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
exports.ChaosMonkeyService = void 0;
const common_1 = require("@nestjs/common");
const json_database_service_1 = require("./json-database.service");
const types_1 = require("../types");
let ChaosMonkeyService = class ChaosMonkeyService {
    constructor(dbService) {
        this.dbService = dbService;
        this.activeExperiments = new Map();
    }
    async onModuleInit() {
        const experiments = await this.dbService.getChaosExperiments();
        for (const exp of experiments) {
            if (exp.status === 'running') {
                await this.startExperiment(exp.id);
            }
        }
    }
    async startExperiment(experimentId) {
        const experiment = await this.dbService.getChaosExperiment(experimentId);
        if (!experiment)
            return null;
        if (experiment.status === 'running') {
            return experiment;
        }
        const updatedExperiment = await this.dbService.updateChaosExperiment(experimentId, {
            status: 'running',
            startTime: Date.now(),
        });
        if (!updatedExperiment)
            return null;
        const activeExp = {
            experiment: updatedExperiment,
            interval: null,
        };
        if (updatedExperiment.duration > 0) {
            activeExp.interval = setTimeout(async () => {
                await this.stopExperiment(experimentId);
            }, updatedExperiment.duration);
        }
        this.activeExperiments.set(experimentId, activeExp);
        return updatedExperiment;
    }
    async stopExperiment(experimentId) {
        const active = this.activeExperiments.get(experimentId);
        if (active && active.interval) {
            clearTimeout(active.interval);
        }
        this.activeExperiments.delete(experimentId);
        return this.dbService.updateChaosExperiment(experimentId, {
            status: 'completed',
        });
    }
    async pauseExperiment(experimentId) {
        const active = this.activeExperiments.get(experimentId);
        if (active && active.interval) {
            clearTimeout(active.interval);
            active.interval = null;
        }
        return this.dbService.updateChaosExperiment(experimentId, {
            status: 'paused',
        });
    }
    async resumeExperiment(experimentId) {
        const experiment = await this.dbService.getChaosExperiment(experimentId);
        if (!experiment || experiment.status !== 'paused')
            return null;
        const active = this.activeExperiments.get(experimentId);
        if (active) {
            if (experiment.duration > 0) {
                active.interval = setTimeout(async () => {
                    await this.stopExperiment(experimentId);
                }, experiment.duration);
            }
        }
        return this.dbService.updateChaosExperiment(experimentId, {
            status: 'running',
        });
    }
    async applyChaos(endpoint, method) {
        for (const [, active] of this.activeExperiments) {
            const { experiment } = active;
            const endpointMatch = this.matchEndpoint(endpoint, experiment.targetEndpoint);
            const methodMatch = experiment.targetMethod === '*' ||
                experiment.targetMethod.toUpperCase() === method.toUpperCase();
            if (endpointMatch && methodMatch) {
                if (Math.random() > experiment.probability) {
                    continue;
                }
                return this.createChaosEffect(experiment);
            }
        }
        return null;
    }
    matchEndpoint(endpoint, pattern) {
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(endpoint);
    }
    createChaosEffect(experiment) {
        const intensity = experiment.intensity / 100;
        switch (experiment.type) {
            case types_1.ChaosType.LATENCY:
                const minLatency = 100 * intensity;
                const maxLatency = 5000 * intensity;
                return {
                    type: 'latency',
                    delay: Math.floor(minLatency + Math.random() * (maxLatency - minLatency)),
                };
            case types_1.ChaosType.EXCEPTION:
                return {
                    type: 'exception',
                    error: new Error(`Chaos Monkey: ${experiment.name}`),
                };
            case types_1.ChaosType.ABORT:
                return {
                    type: 'abort',
                    statusCode: 500 + Math.floor(Math.random() * 3),
                };
            case types_1.ChaosType.CPU_STRESS:
                return {
                    type: 'cpu_stress',
                    duration: Math.floor(1000 * intensity),
                };
            case types_1.ChaosType.MEMORY_STRESS:
                return {
                    type: 'memory_stress',
                    size: Math.floor(10 * 1024 * 1024 * intensity),
                };
            default:
                return {
                    type: 'none',
                };
        }
    }
    async getActiveExperiments() {
        const experiments = await this.dbService.getChaosExperiments();
        return experiments.filter(e => e.status === 'running');
    }
    async getExperimentById(id) {
        return this.dbService.getChaosExperiment(id);
    }
    async getAllExperiments() {
        return this.dbService.getChaosExperiments();
    }
};
exports.ChaosMonkeyService = ChaosMonkeyService;
exports.ChaosMonkeyService = ChaosMonkeyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_database_service_1.JsonDatabaseService])
], ChaosMonkeyService);
//# sourceMappingURL=chaos-monkey.service.js.map