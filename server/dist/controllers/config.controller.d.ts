import { JsonDatabaseService } from '../services/json-database.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { RateLimiterService } from '../services/rate-limiter.service';
import { IsolationService } from '../services/isolation.service';
import { CircuitBreakerConfig } from '../types';
export declare class ConfigController {
    private readonly dbService;
    private readonly circuitService;
    private readonly rateLimiterService;
    private readonly isolationService;
    constructor(dbService: JsonDatabaseService, circuitService: CircuitBreakerService, rateLimiterService: RateLimiterService, isolationService: IsolationService);
    getAllCircuitConfigs(): Promise<CircuitBreakerConfig[]>;
    getCircuitConfig(id: string): Promise<CircuitBreakerConfig>;
    createCircuitConfig(body: Omit<CircuitBreakerConfig, 'id'>): Promise<CircuitBreakerConfig>;
    updateCircuitConfig(id: string, body: Partial<CircuitBreakerConfig>): Promise<CircuitBreakerConfig>;
    deleteCircuitConfig(id: string): Promise<{
        success: boolean;
    }>;
    resetCircuitBreaker(id: string): Promise<{
        success: boolean;
    }>;
    forceOpenCircuit(id: string): Promise<{
        success: boolean;
    }>;
    forceClosedCircuit(id: string): Promise<{
        success: boolean;
    }>;
    getAllRateLimitRules(): Promise<import("../types").RateLimitRule[]>;
    getRateLimitRule(id: string): Promise<import("../types").RateLimitRule>;
    createRateLimitRule(body: any): Promise<import("../types").RateLimitRule>;
    updateRateLimitRule(id: string, body: any): Promise<import("../types").RateLimitRule>;
    deleteRateLimitRule(id: string): Promise<{
        success: boolean;
    }>;
    resetRateLimiter(id: string): Promise<{
        success: boolean;
    }>;
    getAllIsolationConfigs(): Promise<import("../types").IsolationConfig[]>;
    getIsolationConfig(id: string): Promise<import("../types").IsolationConfig>;
    createIsolationConfig(body: any): Promise<import("../types").IsolationConfig>;
    updateIsolationConfig(id: string, body: any): Promise<import("../types").IsolationConfig>;
    deleteIsolationConfig(id: string): Promise<{
        success: boolean;
    }>;
    resetIsolation(id: string): Promise<{
        success: boolean;
    }>;
}
