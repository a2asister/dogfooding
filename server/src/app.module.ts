import { Module, OnModuleInit } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { ConfigController } from './controllers/config.controller';
import { ChaosController } from './controllers/chaos.controller';
import { JsonDatabaseService } from './services/json-database.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { IsolationService } from './services/isolation.service';
import { ChaosMonkeyService } from './services/chaos-monkey.service';
import { TestController } from './controllers/test.controller';

@Module({
  controllers: [
    DashboardController,
    ConfigController,
    ChaosController,
    TestController,
  ],
  providers: [
    JsonDatabaseService,
    CircuitBreakerService,
    RateLimiterService,
    IsolationService,
    ChaosMonkeyService,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly isolationService: IsolationService,
  ) {}

  async onModuleInit() {
    await this.circuitBreakerService.initializeCircuits();
    await this.rateLimiterService.initializeRules();
    await this.isolationService.initializeIsolations();
  }
}
