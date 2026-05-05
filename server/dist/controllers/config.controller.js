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
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const json_database_service_1 = require("../services/json-database.service");
const circuit_breaker_service_1 = require("../services/circuit-breaker.service");
const rate_limiter_service_1 = require("../services/rate-limiter.service");
const isolation_service_1 = require("../services/isolation.service");
const types_1 = require("../types");
let ConfigController = class ConfigController {
    constructor(dbService, circuitService, rateLimiterService, isolationService) {
        this.dbService = dbService;
        this.circuitService = circuitService;
        this.rateLimiterService = rateLimiterService;
        this.isolationService = isolationService;
    }
    async getAllCircuitConfigs() {
        const configs = await this.dbService.getCircuitConfigs();
        return configs;
    }
    async getCircuitConfig(id) {
        const config = await this.dbService.getCircuitConfig(id);
        if (!config) {
            throw new common_1.HttpException('Circuit breaker config not found', common_1.HttpStatus.NOT_FOUND);
        }
        return config;
    }
    async createCircuitConfig(body) {
        if (!body.name) {
            throw new common_1.HttpException('Name is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const newConfig = await this.dbService.createCircuitConfig({
            name: body.name,
            failureThreshold: body.failureThreshold ?? 50,
            slowCallThreshold: body.slowCallThreshold ?? 50,
            slowCallDurationThreshold: body.slowCallDurationThreshold ?? 1000,
            waitDurationInOpenState: body.waitDurationInOpenState ?? 30000,
            permittedNumberOfCallsInHalfOpenState: body.permittedNumberOfCallsInHalfOpenState ?? 3,
            slidingWindowType: body.slidingWindowType ?? 'count_based',
            slidingWindowSize: body.slidingWindowSize ?? 10,
            minimumNumberOfCalls: body.minimumNumberOfCalls ?? 5,
            enabled: body.enabled ?? true,
            isolationLevel: body.isolationLevel ?? types_1.IsolationLevel.SEMAPHORE,
            maxConcurrentCalls: body.maxConcurrentCalls ?? 10,
        });
        return newConfig;
    }
    async updateCircuitConfig(id, body) {
        const updated = await this.dbService.updateCircuitConfig(id, body);
        if (!updated) {
            throw new common_1.HttpException('Circuit breaker config not found', common_1.HttpStatus.NOT_FOUND);
        }
        return updated;
    }
    async deleteCircuitConfig(id) {
        const deleted = await this.dbService.deleteCircuitConfig(id);
        if (!deleted) {
            throw new common_1.HttpException('Circuit breaker config not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
    async resetCircuitBreaker(id) {
        await this.circuitService.resetCircuit(id);
        return { success: true };
    }
    async forceOpenCircuit(id) {
        await this.circuitService.forceOpen(id);
        return { success: true };
    }
    async forceClosedCircuit(id) {
        await this.circuitService.forceClosed(id);
        return { success: true };
    }
    async getAllRateLimitRules() {
        const rules = await this.dbService.getRateLimitRules();
        return rules;
    }
    async getRateLimitRule(id) {
        const rule = await this.dbService.getRateLimitRule(id);
        if (!rule) {
            throw new common_1.HttpException('Rate limit rule not found', common_1.HttpStatus.NOT_FOUND);
        }
        return rule;
    }
    async createRateLimitRule(body) {
        if (!body.name || !body.endpoint) {
            throw new common_1.HttpException('Name and endpoint are required', common_1.HttpStatus.BAD_REQUEST);
        }
        const newRule = await this.dbService.createRateLimitRule({
            name: body.name,
            endpoint: body.endpoint,
            method: body.method ?? '*',
            limitType: body.limitType ?? 'token_bucket',
            limit: body.limit ?? 100,
            windowSize: body.windowSize ?? 60000,
            burstLimit: body.burstLimit ?? 50,
            adaptive: body.adaptive ?? false,
            minLimit: body.minLimit ?? 20,
            maxLimit: body.maxLimit ?? 200,
            targetLatency: body.targetLatency ?? 200,
            enabled: body.enabled ?? true,
        });
        return newRule;
    }
    async updateRateLimitRule(id, body) {
        const updated = await this.dbService.updateRateLimitRule(id, body);
        if (!updated) {
            throw new common_1.HttpException('Rate limit rule not found', common_1.HttpStatus.NOT_FOUND);
        }
        return updated;
    }
    async deleteRateLimitRule(id) {
        const deleted = await this.dbService.deleteRateLimitRule(id);
        if (!deleted) {
            throw new common_1.HttpException('Rate limit rule not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
    async resetRateLimiter(id) {
        await this.rateLimiterService.resetRule(id);
        return { success: true };
    }
    async getAllIsolationConfigs() {
        const configs = await this.dbService.getIsolationConfigs();
        return configs;
    }
    async getIsolationConfig(id) {
        const config = await this.dbService.getIsolationConfig(id);
        if (!config) {
            throw new common_1.HttpException('Isolation config not found', common_1.HttpStatus.NOT_FOUND);
        }
        return config;
    }
    async createIsolationConfig(body) {
        if (!body.name || !body.serviceName) {
            throw new common_1.HttpException('Name and serviceName are required', common_1.HttpStatus.BAD_REQUEST);
        }
        const newConfig = await this.dbService.createIsolationConfig({
            name: body.name,
            serviceName: body.serviceName,
            level: body.level ?? types_1.IsolationLevel.BULKHEAD,
            maxConcurrent: body.maxConcurrent ?? 20,
            queueSize: body.queueSize ?? 100,
            timeout: body.timeout ?? 5000,
            enabled: body.enabled ?? true,
        });
        return newConfig;
    }
    async updateIsolationConfig(id, body) {
        const updated = await this.dbService.updateIsolationConfig(id, body);
        if (!updated) {
            throw new common_1.HttpException('Isolation config not found', common_1.HttpStatus.NOT_FOUND);
        }
        return updated;
    }
    async deleteIsolationConfig(id) {
        const deleted = await this.dbService.deleteIsolationConfig(id);
        if (!deleted) {
            throw new common_1.HttpException('Isolation config not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
    async resetIsolation(id) {
        await this.isolationService.resetIsolation(id);
        return { success: true };
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, common_1.Get)('circuit-breakers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getAllCircuitConfigs", null);
__decorate([
    (0, common_1.Get)('circuit-breakers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getCircuitConfig", null);
__decorate([
    (0, common_1.Post)('circuit-breakers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "createCircuitConfig", null);
__decorate([
    (0, common_1.Put)('circuit-breakers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateCircuitConfig", null);
__decorate([
    (0, common_1.Delete)('circuit-breakers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "deleteCircuitConfig", null);
__decorate([
    (0, common_1.Post)('circuit-breakers/:id/reset'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "resetCircuitBreaker", null);
__decorate([
    (0, common_1.Post)('circuit-breakers/:id/force-open'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "forceOpenCircuit", null);
__decorate([
    (0, common_1.Post)('circuit-breakers/:id/force-closed'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "forceClosedCircuit", null);
__decorate([
    (0, common_1.Get)('rate-limiters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getAllRateLimitRules", null);
__decorate([
    (0, common_1.Get)('rate-limiters/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getRateLimitRule", null);
__decorate([
    (0, common_1.Post)('rate-limiters'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "createRateLimitRule", null);
__decorate([
    (0, common_1.Put)('rate-limiters/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateRateLimitRule", null);
__decorate([
    (0, common_1.Delete)('rate-limiters/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "deleteRateLimitRule", null);
__decorate([
    (0, common_1.Post)('rate-limiters/:id/reset'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "resetRateLimiter", null);
__decorate([
    (0, common_1.Get)('isolations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getAllIsolationConfigs", null);
__decorate([
    (0, common_1.Get)('isolations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getIsolationConfig", null);
__decorate([
    (0, common_1.Post)('isolations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "createIsolationConfig", null);
__decorate([
    (0, common_1.Put)('isolations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateIsolationConfig", null);
__decorate([
    (0, common_1.Delete)('isolations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "deleteIsolationConfig", null);
__decorate([
    (0, common_1.Post)('isolations/:id/reset'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "resetIsolation", null);
exports.ConfigController = ConfigController = __decorate([
    (0, common_1.Controller)('config'),
    __metadata("design:paramtypes", [json_database_service_1.JsonDatabaseService,
        circuit_breaker_service_1.CircuitBreakerService,
        rate_limiter_service_1.RateLimiterService,
        isolation_service_1.IsolationService])
], ConfigController);
//# sourceMappingURL=config.controller.js.map