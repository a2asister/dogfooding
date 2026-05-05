import { OnModuleInit } from '@nestjs/common';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { IsolationService } from './services/isolation.service';
export declare class AppModule implements OnModuleInit {
    private readonly circuitBreakerService;
    private readonly rateLimiterService;
    private readonly isolationService;
    constructor(circuitBreakerService: CircuitBreakerService, rateLimiterService: RateLimiterService, isolationService: IsolationService);
    onModuleInit(): Promise<void>;
}
