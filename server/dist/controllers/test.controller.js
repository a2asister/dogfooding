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
exports.TestController = void 0;
const common_1 = require("@nestjs/common");
const circuit_breaker_service_1 = require("../services/circuit-breaker.service");
const rate_limiter_service_1 = require("../services/rate-limiter.service");
const isolation_service_1 = require("../services/isolation.service");
const chaos_monkey_service_1 = require("../services/chaos-monkey.service");
let TestController = class TestController {
    constructor(circuitBreakerService, rateLimiterService, isolationService, chaosMonkeyService) {
        this.circuitBreakerService = circuitBreakerService;
        this.rateLimiterService = rateLimiterService;
        this.isolationService = isolationService;
        this.chaosMonkeyService = chaosMonkeyService;
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async applyChaosEffect(effect) {
        if (!effect)
            return;
        switch (effect.type) {
            case 'latency':
                if (effect.delay) {
                    await this.sleep(effect.delay);
                }
                break;
            case 'exception':
                throw effect.error || new Error('Chaos Monkey: Simulated exception');
            case 'abort':
                throw new common_1.HttpException('Chaos Monkey: Request aborted', effect.statusCode || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            case 'cpu_stress':
                if (effect.duration) {
                    const end = Date.now() + effect.duration;
                    while (Date.now() < end) {
                        Math.sqrt(Math.random() * 1000000);
                    }
                }
                break;
            case 'memory_stress':
                if (effect.size) {
                    const stressData = new Array(effect.size / 8).fill(0);
                    await this.sleep(100);
                }
                break;
        }
    }
    async testApiCall(circuitId, isolationId, fail, slow, delay) {
        const startTime = Date.now();
        const endpoint = '/api/test/api-call';
        const method = 'GET';
        const rateLimitResult = await this.rateLimiterService.checkRateLimit(endpoint, method);
        if (!rateLimitResult.allowed) {
            throw new common_1.HttpException({
                message: 'Rate limit exceeded',
                currentLimit: rateLimitResult.currentLimit,
                resetTime: rateLimitResult.resetTime,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const chaosEffect = await this.chaosMonkeyService.applyChaos(endpoint, method);
        await this.applyChaosEffect(chaosEffect);
        let acquireResult = null;
        if (isolationId) {
            acquireResult = await this.isolationService.acquire(isolationId);
            if (!acquireResult.acquired) {
                throw new common_1.HttpException({
                    message: 'Isolation capacity exceeded',
                    reason: acquireResult.reason,
                }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
        try {
            if (circuitId) {
                return await this.circuitBreakerService.execute(circuitId, async () => {
                    return this.performTestCall(fail, slow, delay);
                }, async () => {
                    return {
                        fallback: true,
                        message: 'Fallback response - circuit is open or request failed',
                        timestamp: Date.now(),
                    };
                });
            }
            return await this.performTestCall(fail, slow, delay);
        }
        finally {
            if (acquireResult && acquireResult.release) {
                await acquireResult.release();
            }
            const responseTime = Date.now() - startTime;
            await this.rateLimiterService.checkRateLimit(endpoint, method, responseTime);
        }
    }
    async performTestCall(fail, slow, delay) {
        const actualDelay = delay ? parseInt(delay, 10) : 0;
        const shouldFail = fail === 'true';
        const shouldSlow = slow === 'true';
        if (shouldSlow || actualDelay > 0) {
            const totalDelay = shouldSlow ? 1500 : actualDelay;
            await this.sleep(totalDelay);
        }
        if (shouldFail) {
            throw new common_1.HttpException({ message: 'Simulated error for testing circuit breaker' }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            success: true,
            timestamp: Date.now(),
            message: 'Test API call successful',
            delay: actualDelay,
            simulated: {
                fail: shouldFail,
                slow: shouldSlow,
            },
        };
    }
    async batchFail(circuitId, count) {
        const requestCount = count ? parseInt(count, 10) : 5;
        const results = [];
        for (let i = 0; i < requestCount; i++) {
            try {
                if (circuitId) {
                    const result = await this.circuitBreakerService.execute(circuitId, async () => {
                        throw new common_1.HttpException({ message: `Simulated error #${i + 1}` }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                    }, async () => {
                        return {
                            fallback: true,
                            index: i + 1,
                            timestamp: Date.now(),
                        };
                    });
                    results.push({ index: i + 1, success: true, result });
                }
                else {
                    results.push({ index: i + 1, success: false, error: 'No circuitId provided' });
                }
            }
            catch (error) {
                results.push({
                    index: i + 1,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return {
            total: requestCount,
            results,
            timestamp: Date.now(),
        };
    }
    async isolationTest(isolationId, delay) {
        const acquireResult = await this.isolationService.acquire(isolationId);
        if (!acquireResult.acquired) {
            throw new common_1.HttpException({
                message: 'Isolation capacity exceeded',
                reason: acquireResult.reason,
                timestamp: Date.now(),
            }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            const actualDelay = delay ? parseInt(delay, 10) : 100;
            await this.sleep(actualDelay);
            return {
                success: true,
                isolationId,
                delay: actualDelay,
                timestamp: Date.now(),
            };
        }
        finally {
            if (acquireResult.release) {
                await acquireResult.release();
            }
        }
    }
};
exports.TestController = TestController;
__decorate([
    (0, common_1.Get)('api-call'),
    __param(0, (0, common_1.Query)('circuitId')),
    __param(1, (0, common_1.Query)('isolationId')),
    __param(2, (0, common_1.Query)('fail')),
    __param(3, (0, common_1.Query)('slow')),
    __param(4, (0, common_1.Query)('delay')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "testApiCall", null);
__decorate([
    (0, common_1.Post)('batch-fail'),
    __param(0, (0, common_1.Query)('circuitId')),
    __param(1, (0, common_1.Query)('count')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "batchFail", null);
__decorate([
    (0, common_1.Get)('isolation-test'),
    __param(0, (0, common_1.Query)('isolationId')),
    __param(1, (0, common_1.Query)('delay')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "isolationTest", null);
exports.TestController = TestController = __decorate([
    (0, common_1.Controller)('test'),
    __metadata("design:paramtypes", [circuit_breaker_service_1.CircuitBreakerService,
        rate_limiter_service_1.RateLimiterService,
        isolation_service_1.IsolationService,
        chaos_monkey_service_1.ChaosMonkeyService])
], TestController);
//# sourceMappingURL=test.controller.js.map