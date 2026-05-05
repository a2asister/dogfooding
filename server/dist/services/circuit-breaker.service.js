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
exports.CircuitBreakerService = void 0;
const common_1 = require("@nestjs/common");
const json_database_service_1 = require("./json-database.service");
const types_1 = require("../types");
let CircuitBreakerService = class CircuitBreakerService {
    constructor(dbService) {
        this.dbService = dbService;
        this.circuits = new Map();
    }
    async initializeCircuits() {
        const configs = await this.dbService.getCircuitConfigs();
        const states = await this.dbService.getCircuitStates();
        for (const config of configs) {
            const state = states.find(s => s.circuitId === config.id);
            if (state) {
                this.circuits.set(config.id, {
                    config,
                    state,
                    slidingWindow: { calls: [], totalDuration: 0 },
                    responseTimes: [],
                });
            }
        }
    }
    async execute(circuitId, supplier, fallback) {
        const circuit = this.circuits.get(circuitId);
        if (!circuit || !circuit.config.enabled) {
            return supplier();
        }
        const start = Date.now();
        if (!this.acquirePermission(circuit)) {
            await this.recordCall(circuit, start, false, true);
            if (fallback) {
                return fallback();
            }
            throw new Error(`Circuit ${circuit.config.name} is ${circuit.state.state}`);
        }
        try {
            const result = await supplier();
            const duration = Date.now() - start;
            const isSlow = duration > circuit.config.slowCallDurationThreshold;
            await this.recordCall(circuit, start, true, false, isSlow, duration);
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            await this.recordCall(circuit, start, false, false, false, duration);
            if (fallback) {
                return fallback();
            }
            throw error;
        }
    }
    acquirePermission(circuit) {
        const now = Date.now();
        switch (circuit.state.state) {
            case types_1.CircuitState.OPEN:
                if (now - circuit.state.lastStateTransitionTime >= circuit.config.waitDurationInOpenState) {
                    this.transitionTo(circuit, types_1.CircuitState.HALF_OPEN);
                    return true;
                }
                circuit.state.numberOfNotPermittedCalls++;
                return false;
            case types_1.CircuitState.HALF_OPEN:
                const allowedCalls = circuit.slidingWindow.calls.filter(c => c.timestamp > circuit.state.lastStateTransitionTime).length;
                return allowedCalls < circuit.config.permittedNumberOfCallsInHalfOpenState;
            case types_1.CircuitState.CLOSED:
            default:
                return true;
        }
    }
    async recordCall(circuit, startTime, success, notPermitted, isSlow = false, duration = 0) {
        if (notPermitted) {
            circuit.state.numberOfNotPermittedCalls++;
            return;
        }
        const call = {
            duration,
            success,
            slow: isSlow,
            timestamp: startTime,
        };
        circuit.slidingWindow.calls.push(call);
        circuit.slidingWindow.totalDuration += duration;
        circuit.responseTimes.push(duration);
        if (circuit.config.slidingWindowType === 'count_based') {
            while (circuit.slidingWindow.calls.length > circuit.config.slidingWindowSize) {
                const removed = circuit.slidingWindow.calls.shift();
                if (removed) {
                    circuit.slidingWindow.totalDuration -= removed.duration;
                }
            }
        }
        else {
            const cutoff = startTime - circuit.config.slidingWindowSize;
            circuit.slidingWindow.calls = circuit.slidingWindow.calls.filter(c => c.timestamp > cutoff);
            circuit.slidingWindow.totalDuration = circuit.slidingWindow.calls.reduce((sum, c) => sum + c.duration, 0);
        }
        if (circuit.responseTimes.length > 100) {
            circuit.responseTimes = circuit.responseTimes.slice(-100);
        }
        if (success) {
            circuit.state.numberOfSuccessfulCalls++;
            if (circuit.state.state === types_1.CircuitState.HALF_OPEN) {
                const recentCalls = circuit.slidingWindow.calls.filter(c => c.timestamp > circuit.state.lastStateTransitionTime);
                const successCount = recentCalls.filter(c => c.success).length;
                if (successCount >= circuit.config.permittedNumberOfCallsInHalfOpenState) {
                    this.transitionTo(circuit, types_1.CircuitState.CLOSED);
                }
            }
        }
        else {
            circuit.state.numberOfFailedCalls++;
            circuit.state.lastFailureTime = startTime;
        }
        if (isSlow) {
            circuit.state.numberOfSlowCalls++;
        }
        this.updateFailureRates(circuit);
        this.checkThresholds(circuit);
        circuit.state.metrics = this.calculateMetrics(circuit);
        await this.dbService.updateCircuitState(circuit.config.id, circuit.state);
        await this.dbService.addMetricsSnapshot({ ...circuit.state.metrics });
    }
    updateFailureRates(circuit) {
        const calls = circuit.slidingWindow.calls;
        if (calls.length < circuit.config.minimumNumberOfCalls) {
            circuit.state.failureRate = 0;
            circuit.state.slowCallRate = 0;
            return;
        }
        const failureCount = calls.filter(c => !c.success).length;
        const slowCount = calls.filter(c => c.slow).length;
        circuit.state.failureRate = (failureCount / calls.length) * 100;
        circuit.state.slowCallRate = (slowCount / calls.length) * 100;
    }
    checkThresholds(circuit) {
        if (circuit.slidingWindow.calls.length < circuit.config.minimumNumberOfCalls) {
            return;
        }
        if (circuit.state.state === types_1.CircuitState.HALF_OPEN) {
            const recentCalls = circuit.slidingWindow.calls.filter(c => c.timestamp > circuit.state.lastStateTransitionTime);
            const failures = recentCalls.filter(c => !c.success).length;
            if (failures > 0) {
                this.transitionTo(circuit, types_1.CircuitState.OPEN);
            }
            return;
        }
        if (circuit.state.state === types_1.CircuitState.CLOSED) {
            if (circuit.state.failureRate >= circuit.config.failureThreshold ||
                circuit.state.slowCallRate >= circuit.config.slowCallThreshold) {
                this.transitionTo(circuit, types_1.CircuitState.OPEN);
            }
        }
    }
    transitionTo(circuit, newState) {
        circuit.state.state = newState;
        circuit.state.lastStateTransitionTime = Date.now();
        circuit.slidingWindow.calls = [];
        circuit.slidingWindow.totalDuration = 0;
    }
    calculateMetrics(circuit) {
        const calls = circuit.slidingWindow.calls;
        const responseTimes = [...circuit.responseTimes].sort((a, b) => a - b);
        const totalCalls = calls.length;
        const successCount = calls.filter(c => c.success).length;
        const failureCount = calls.filter(c => !c.success).length;
        const slowCallCount = calls.filter(c => c.slow).length;
        const averageResponseTime = totalCalls > 0
            ? circuit.slidingWindow.totalDuration / totalCalls
            : 0;
        const p95Index = Math.floor(responseTimes.length * 0.95);
        const p99Index = Math.floor(responseTimes.length * 0.99);
        return {
            totalCalls,
            successCount,
            failureCount,
            slowCallCount,
            timeoutCount: 0,
            averageResponseTime: Math.round(averageResponseTime),
            p95ResponseTime: responseTimes[p95Index] || 0,
            p99ResponseTime: responseTimes[p99Index] || 0,
            timestamp: Date.now(),
        };
    }
    async resetCircuit(circuitId) {
        const circuit = this.circuits.get(circuitId);
        if (!circuit)
            return;
        circuit.state.state = types_1.CircuitState.CLOSED;
        circuit.state.failureRate = 0;
        circuit.state.slowCallRate = 0;
        circuit.state.numberOfSuccessfulCalls = 0;
        circuit.state.numberOfFailedCalls = 0;
        circuit.state.numberOfSlowCalls = 0;
        circuit.state.numberOfNotPermittedCalls = 0;
        circuit.state.lastStateTransitionTime = Date.now();
        circuit.slidingWindow.calls = [];
        circuit.slidingWindow.totalDuration = 0;
        circuit.responseTimes = [];
        await this.dbService.updateCircuitState(circuitId, circuit.state);
    }
    async forceOpen(circuitId) {
        const circuit = this.circuits.get(circuitId);
        if (!circuit)
            return;
        this.transitionTo(circuit, types_1.CircuitState.OPEN);
        await this.dbService.updateCircuitState(circuitId, circuit.state);
    }
    async forceClosed(circuitId) {
        const circuit = this.circuits.get(circuitId);
        if (!circuit)
            return;
        this.transitionTo(circuit, types_1.CircuitState.CLOSED);
        await this.dbService.updateCircuitState(circuitId, circuit.state);
    }
    async getCircuitState(circuitId) {
        return this.dbService.getCircuitState(circuitId) || null;
    }
    async getAllCircuitStates() {
        const configs = await this.dbService.getCircuitConfigs();
        const states = await this.dbService.getCircuitStates();
        return configs
            .map(config => {
            const state = states.find(s => s.circuitId === config.id);
            return state ? { config, state } : null;
        })
            .filter((item) => item !== null);
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_database_service_1.JsonDatabaseService])
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map