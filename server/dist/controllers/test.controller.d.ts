import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { RateLimiterService } from '../services/rate-limiter.service';
import { IsolationService } from '../services/isolation.service';
import { ChaosMonkeyService } from '../services/chaos-monkey.service';
export declare class TestController {
    private readonly circuitBreakerService;
    private readonly rateLimiterService;
    private readonly isolationService;
    private readonly chaosMonkeyService;
    constructor(circuitBreakerService: CircuitBreakerService, rateLimiterService: RateLimiterService, isolationService: IsolationService, chaosMonkeyService: ChaosMonkeyService);
    private sleep;
    private applyChaosEffect;
    testApiCall(circuitId?: string, isolationId?: string, fail?: string, slow?: string, delay?: string): Promise<any>;
    private performTestCall;
    batchFail(circuitId?: string, count?: string): Promise<{
        total: number;
        results: any[];
        timestamp: number;
    }>;
    isolationTest(isolationId: string, delay?: string): Promise<{
        success: boolean;
        isolationId: string;
        delay: number;
        timestamp: number;
    }>;
}
