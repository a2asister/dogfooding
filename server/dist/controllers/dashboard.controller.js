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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const json_database_service_1 = require("../services/json-database.service");
const circuit_breaker_service_1 = require("../services/circuit-breaker.service");
const rate_limiter_service_1 = require("../services/rate-limiter.service");
const isolation_service_1 = require("../services/isolation.service");
const chaos_monkey_service_1 = require("../services/chaos-monkey.service");
let DashboardController = class DashboardController {
    constructor(dbService, circuitService, rateLimiterService, isolationService, chaosService) {
        this.dbService = dbService;
        this.circuitService = circuitService;
        this.rateLimiterService = rateLimiterService;
        this.isolationService = isolationService;
        this.chaosService = chaosService;
    }
    async getOverview() {
        const circuits = await this.circuitService.getAllCircuitStates();
        const rules = await this.rateLimiterService.getAllRulesWithStates();
        const isolations = await this.isolationService.getAllIsolationsWithStates();
        const experiments = await this.chaosService.getAllExperiments();
        const metricsHistory = await this.dbService.getMetricsHistory(Date.now() - 3600000, Date.now());
        const openCircuits = circuits.filter(c => c.state.state === 'open').length;
        const halfOpenCircuits = circuits.filter(c => c.state.state === 'half_open').length;
        const closedCircuits = circuits.filter(c => c.state.state === 'closed').length;
        const runningExperiments = experiments.filter(e => e.status === 'running').length;
        const pausedExperiments = experiments.filter(e => e.status === 'paused').length;
        const completedExperiments = experiments.filter(e => e.status === 'completed').length;
        const totalActiveRequests = isolations.reduce((sum, i) => sum + i.state.activeRequests, 0);
        const totalQueuedRequests = isolations.reduce((sum, i) => sum + i.state.queuedRequests, 0);
        const totalRejectedRequests = isolations.reduce((sum, i) => sum + i.state.rejectedRequests, 0);
        let totalCalls = 0;
        let totalSuccess = 0;
        let totalFailure = 0;
        let avgResponseTime = 0;
        if (metricsHistory.length > 0) {
            const recentMetrics = metricsHistory[metricsHistory.length - 1];
            totalCalls = recentMetrics.totalCalls;
            totalSuccess = recentMetrics.successCount;
            totalFailure = recentMetrics.failureCount;
            avgResponseTime = recentMetrics.averageResponseTime;
        }
        else {
            for (const circuit of circuits) {
                totalCalls += circuit.state.metrics.totalCalls;
                totalSuccess += circuit.state.metrics.successCount;
                totalFailure += circuit.state.metrics.failureCount;
                if (circuit.state.metrics.averageResponseTime > 0) {
                    avgResponseTime += circuit.state.metrics.averageResponseTime;
                }
            }
            if (circuits.length > 0) {
                avgResponseTime = avgResponseTime / circuits.length;
            }
        }
        return {
            timestamp: Date.now(),
            circuitBreakers: {
                total: circuits.length,
                open: openCircuits,
                halfOpen: halfOpenCircuits,
                closed: closedCircuits,
            },
            rateLimiters: {
                total: rules.length,
                enabled: rules.filter(r => r.rule.enabled).length,
                adaptive: rules.filter(r => r.rule.adaptive).length,
            },
            isolation: {
                total: isolations.length,
                activeRequests: totalActiveRequests,
                queuedRequests: totalQueuedRequests,
                rejectedRequests: totalRejectedRequests,
            },
            chaosExperiments: {
                total: experiments.length,
                running: runningExperiments,
                paused: pausedExperiments,
                completed: completedExperiments,
            },
            metrics: {
                totalCalls,
                successCount: totalSuccess,
                failureCount: totalFailure,
                successRate: totalCalls > 0 ? (totalSuccess / totalCalls) * 100 : 100,
                averageResponseTime: Math.round(avgResponseTime),
            },
        };
    }
    async getMetricsHistory() {
        const oneHourAgo = Date.now() - 3600000;
        const history = await this.dbService.getMetricsHistory(oneHourAgo, Date.now());
        const metricsByTime = new Map();
        for (const metric of history) {
            const minuteBucket = Math.floor(metric.timestamp / 60000) * 60000;
            if (!metricsByTime.has(minuteBucket)) {
                metricsByTime.set(minuteBucket, {
                    calls: 0,
                    success: 0,
                    failure: 0,
                    avgResponse: 0,
                });
            }
            const bucket = metricsByTime.get(minuteBucket);
            bucket.calls += metric.totalCalls;
            bucket.success += metric.successCount;
            bucket.failure += metric.failureCount;
            bucket.avgResponse += metric.averageResponseTime;
        }
        return Array.from(metricsByTime.entries())
            .map(([timestamp, data]) => ({
            timestamp,
            totalCalls: data.calls,
            successCount: data.success,
            failureCount: data.failure,
            averageResponseTime: Math.round(data.avgResponse),
            successRate: data.calls > 0 ? (data.success / data.calls) * 100 : 100,
        }))
            .sort((a, b) => a.timestamp - b.timestamp);
    }
    async getCircuitBreakers() {
        const circuits = await this.circuitService.getAllCircuitStates();
        return circuits.map(({ config, state }) => ({
            id: config.id,
            name: config.name,
            enabled: config.enabled,
            state: state.state,
            failureRate: state.failureRate,
            slowCallRate: state.slowCallRate,
            metrics: state.metrics,
            config: {
                failureThreshold: config.failureThreshold,
                slowCallThreshold: config.slowCallThreshold,
                isolationLevel: config.isolationLevel,
                waitDurationInOpenState: config.waitDurationInOpenState,
                slowCallDurationThreshold: config.slowCallDurationThreshold,
                slidingWindowType: config.slidingWindowType,
                slidingWindowSize: config.slidingWindowSize,
                minimumNumberOfCalls: config.minimumNumberOfCalls,
                permittedNumberOfCallsInHalfOpenState: config.permittedNumberOfCallsInHalfOpenState,
                maxConcurrentCalls: config.maxConcurrentCalls,
            },
        }));
    }
    async getRateLimiters() {
        const rules = await this.rateLimiterService.getAllRulesWithStates();
        return rules.map(({ rule, state }) => ({
            id: rule.id,
            name: rule.name,
            endpoint: rule.endpoint,
            method: rule.method,
            enabled: rule.enabled,
            limitType: rule.limitType,
            currentLimit: state.currentLimit,
            baseLimit: rule.limit,
            adaptive: rule.adaptive,
            remaining: Math.floor(state.tokens),
            requestsInWindow: state.requestsInWindow,
            adaptiveAdjustments: state.adaptiveAdjustments,
        }));
    }
    async getIsolations() {
        const isolations = await this.isolationService.getAllIsolationsWithStates();
        return isolations.map(({ config, state }) => ({
            id: config.id,
            name: config.name,
            serviceName: config.serviceName,
            enabled: config.enabled,
            level: config.level,
            maxConcurrent: config.maxConcurrent,
            activeRequests: state.activeRequests,
            queuedRequests: state.queuedRequests,
            rejectedRequests: state.rejectedRequests,
            timeouts: state.timeouts,
            utilization: config.maxConcurrent > 0
                ? (state.activeRequests / config.maxConcurrent) * 100
                : 0,
        }));
    }
    async getChaosExperiments() {
        const experiments = await this.chaosService.getAllExperiments();
        return experiments.map(exp => ({
            id: exp.id,
            name: exp.name,
            description: exp.description,
            type: exp.type,
            targetEndpoint: exp.targetEndpoint,
            targetMethod: exp.targetMethod,
            intensity: exp.intensity,
            duration: exp.duration,
            probability: exp.probability,
            startTime: exp.startTime,
            status: exp.status,
            elapsedTime: exp.status === 'running' && exp.startTime
                ? Date.now() - exp.startTime
                : 0,
        }));
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('metrics-history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getMetricsHistory", null);
__decorate([
    (0, common_1.Get)('circuit-breakers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCircuitBreakers", null);
__decorate([
    (0, common_1.Get)('rate-limiters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRateLimiters", null);
__decorate([
    (0, common_1.Get)('isolations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getIsolations", null);
__decorate([
    (0, common_1.Get)('chaos-experiments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getChaosExperiments", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [json_database_service_1.JsonDatabaseService,
        circuit_breaker_service_1.CircuitBreakerService,
        rate_limiter_service_1.RateLimiterService,
        isolation_service_1.IsolationService,
        chaos_monkey_service_1.ChaosMonkeyService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map