import { JsonDatabaseService } from '../services/json-database.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { RateLimiterService } from '../services/rate-limiter.service';
import { IsolationService } from '../services/isolation.service';
import { ChaosMonkeyService } from '../services/chaos-monkey.service';
export declare class DashboardController {
    private readonly dbService;
    private readonly circuitService;
    private readonly rateLimiterService;
    private readonly isolationService;
    private readonly chaosService;
    constructor(dbService: JsonDatabaseService, circuitService: CircuitBreakerService, rateLimiterService: RateLimiterService, isolationService: IsolationService, chaosService: ChaosMonkeyService);
    getOverview(): Promise<{
        timestamp: number;
        circuitBreakers: {
            total: number;
            open: number;
            halfOpen: number;
            closed: number;
        };
        rateLimiters: {
            total: number;
            enabled: number;
            adaptive: number;
        };
        isolation: {
            total: number;
            activeRequests: number;
            queuedRequests: number;
            rejectedRequests: number;
        };
        chaosExperiments: {
            total: number;
            running: number;
            paused: number;
            completed: number;
        };
        metrics: {
            totalCalls: number;
            successCount: number;
            failureCount: number;
            successRate: number;
            averageResponseTime: number;
        };
    }>;
    getMetricsHistory(): Promise<{
        timestamp: number;
        totalCalls: number;
        successCount: number;
        failureCount: number;
        averageResponseTime: number;
        successRate: number;
    }[]>;
    getCircuitBreakers(): Promise<{
        id: string;
        name: string;
        enabled: boolean;
        state: import("../types").CircuitState;
        failureRate: number;
        slowCallRate: number;
        metrics: import("../types").MetricsSnapshot;
        config: {
            failureThreshold: number;
            slowCallThreshold: number;
            isolationLevel: import("../types").IsolationLevel;
            waitDurationInOpenState: number;
            slowCallDurationThreshold: number;
            slidingWindowType: "count_based" | "time_based";
            slidingWindowSize: number;
            minimumNumberOfCalls: number;
            permittedNumberOfCallsInHalfOpenState: number;
            maxConcurrentCalls: number;
        };
    }[]>;
    getRateLimiters(): Promise<{
        id: string;
        name: string;
        endpoint: string;
        method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "*";
        enabled: boolean;
        limitType: "fixed_window" | "sliding_window" | "token_bucket" | "leaky_bucket";
        currentLimit: number;
        baseLimit: number;
        adaptive: boolean;
        remaining: number;
        requestsInWindow: number;
        adaptiveAdjustments: number;
    }[]>;
    getIsolations(): Promise<{
        id: string;
        name: string;
        serviceName: string;
        enabled: boolean;
        level: import("../types").IsolationLevel;
        maxConcurrent: number;
        activeRequests: number;
        queuedRequests: number;
        rejectedRequests: number;
        timeouts: number;
        utilization: number;
    }[]>;
    getChaosExperiments(): Promise<{
        id: string;
        name: string;
        description: string;
        type: import("../types").ChaosType;
        targetEndpoint: string;
        targetMethod: string;
        intensity: number;
        duration: number;
        probability: number;
        startTime: number;
        status: "idle" | "running" | "paused" | "completed";
        elapsedTime: number;
    }[]>;
}
