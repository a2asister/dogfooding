import { Controller, Get, Post, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { RateLimiterService } from '../services/rate-limiter.service';
import { IsolationService, AcquireResult } from '../services/isolation.service';
import { ChaosMonkeyService, ChaosEffect } from '../services/chaos-monkey.service';

@Controller('test')
export class TestController {
  constructor(
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly isolationService: IsolationService,
    private readonly chaosMonkeyService: ChaosMonkeyService,
  ) {}

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async applyChaosEffect(effect: ChaosEffect | null): Promise<void> {
    if (!effect) return;

    switch (effect.type) {
      case 'latency':
        if (effect.delay) {
          await this.sleep(effect.delay);
        }
        break;

      case 'exception':
        throw effect.error || new Error('Chaos Monkey: Simulated exception');

      case 'abort':
        throw new HttpException(
          'Chaos Monkey: Request aborted',
          effect.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        );

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

  @Get('api-call')
  async testApiCall(
    @Query('circuitId') circuitId?: string,
    @Query('isolationId') isolationId?: string,
    @Query('fail') fail?: string,
    @Query('slow') slow?: string,
    @Query('delay') delay?: string,
  ) {
    const startTime = Date.now();
    const endpoint = '/api/test/api-call';
    const method = 'GET';

    const rateLimitResult = await this.rateLimiterService.checkRateLimit(endpoint, method);
    if (!rateLimitResult.allowed) {
      throw new HttpException({
        message: 'Rate limit exceeded',
        currentLimit: rateLimitResult.currentLimit,
        resetTime: rateLimitResult.resetTime,
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    const chaosEffect = await this.chaosMonkeyService.applyChaos(endpoint, method);
    await this.applyChaosEffect(chaosEffect);

    let acquireResult: AcquireResult | null = null;
    if (isolationId) {
      acquireResult = await this.isolationService.acquire(isolationId);
      if (!acquireResult.acquired) {
        throw new HttpException({
          message: 'Isolation capacity exceeded',
          reason: acquireResult.reason,
        }, HttpStatus.SERVICE_UNAVAILABLE);
      }
    }

    try {
      if (circuitId) {
        return await this.circuitBreakerService.execute(
          circuitId,
          async () => {
            return this.performTestCall(fail, slow, delay);
          },
          async () => {
            return {
              fallback: true,
              message: 'Fallback response - circuit is open or request failed',
              timestamp: Date.now(),
            };
          },
        );
      }

      return await this.performTestCall(fail, slow, delay);
    } finally {
      if (acquireResult && acquireResult.release) {
        await acquireResult.release();
      }

      const responseTime = Date.now() - startTime;
      await this.rateLimiterService.checkRateLimit(endpoint, method, responseTime);
    }
  }

  private async performTestCall(fail?: string, slow?: string, delay?: string): Promise<any> {
    const actualDelay = delay ? parseInt(delay, 10) : 0;
    const shouldFail = fail === 'true';
    const shouldSlow = slow === 'true';

    if (shouldSlow || actualDelay > 0) {
      const totalDelay = shouldSlow ? 1500 : actualDelay;
      await this.sleep(totalDelay);
    }

    if (shouldFail) {
      throw new HttpException(
        { message: 'Simulated error for testing circuit breaker' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

  @Post('batch-fail')
  async batchFail(
    @Query('circuitId') circuitId?: string,
    @Query('count') count?: string,
  ) {
    const requestCount = count ? parseInt(count, 10) : 5;
    const results = [];

    for (let i = 0; i < requestCount; i++) {
      try {
        if (circuitId) {
          const result = await this.circuitBreakerService.execute(
            circuitId,
            async () => {
              throw new HttpException(
                { message: `Simulated error #${i + 1}` },
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            },
            async () => {
              return {
                fallback: true,
                index: i + 1,
                timestamp: Date.now(),
              };
            },
          );
          results.push({ index: i + 1, success: true, result });
        } else {
          results.push({ index: i + 1, success: false, error: 'No circuitId provided' });
        }
      } catch (error) {
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

  @Get('isolation-test')
  async isolationTest(
    @Query('isolationId') isolationId: string,
    @Query('delay') delay?: string,
  ) {
    const acquireResult = await this.isolationService.acquire(isolationId);
    
    if (!acquireResult.acquired) {
      throw new HttpException({
        message: 'Isolation capacity exceeded',
        reason: acquireResult.reason,
        timestamp: Date.now(),
      }, HttpStatus.SERVICE_UNAVAILABLE);
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
    } finally {
      if (acquireResult.release) {
        await acquireResult.release();
      }
    }
  }
}
