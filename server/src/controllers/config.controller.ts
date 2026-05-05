import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { JsonDatabaseService } from '../services/json-database.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { RateLimiterService } from '../services/rate-limiter.service';
import { IsolationService } from '../services/isolation.service';
import { CircuitBreakerConfig, IsolationLevel } from '../types';

@Controller('config')
export class ConfigController {
  constructor(
    private readonly dbService: JsonDatabaseService,
    private readonly circuitService: CircuitBreakerService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly isolationService: IsolationService,
  ) {}

  @Get('circuit-breakers')
  async getAllCircuitConfigs() {
    const configs = await this.dbService.getCircuitConfigs();
    return configs;
  }

  @Get('circuit-breakers/:id')
  async getCircuitConfig(@Param('id') id: string) {
    const config = await this.dbService.getCircuitConfig(id);
    if (!config) {
      throw new HttpException('Circuit breaker config not found', HttpStatus.NOT_FOUND);
    }
    return config;
  }

  @Post('circuit-breakers')
  async createCircuitConfig(@Body() body: Omit<CircuitBreakerConfig, 'id'>) {
    if (!body.name) {
      throw new HttpException('Name is required', HttpStatus.BAD_REQUEST);
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
      isolationLevel: body.isolationLevel ?? IsolationLevel.SEMAPHORE,
      maxConcurrentCalls: body.maxConcurrentCalls ?? 10,
    });

    return newConfig;
  }

  @Put('circuit-breakers/:id')
  async updateCircuitConfig(
    @Param('id') id: string,
    @Body() body: Partial<CircuitBreakerConfig>,
  ) {
    const updated = await this.dbService.updateCircuitConfig(id, body);
    if (!updated) {
      throw new HttpException('Circuit breaker config not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  @Delete('circuit-breakers/:id')
  async deleteCircuitConfig(@Param('id') id: string) {
    const deleted = await this.dbService.deleteCircuitConfig(id);
    if (!deleted) {
      throw new HttpException('Circuit breaker config not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }

  @Post('circuit-breakers/:id/reset')
  async resetCircuitBreaker(@Param('id') id: string) {
    await this.circuitService.resetCircuit(id);
    return { success: true };
  }

  @Post('circuit-breakers/:id/force-open')
  async forceOpenCircuit(@Param('id') id: string) {
    await this.circuitService.forceOpen(id);
    return { success: true };
  }

  @Post('circuit-breakers/:id/force-closed')
  async forceClosedCircuit(@Param('id') id: string) {
    await this.circuitService.forceClosed(id);
    return { success: true };
  }

  @Get('rate-limiters')
  async getAllRateLimitRules() {
    const rules = await this.dbService.getRateLimitRules();
    return rules;
  }

  @Get('rate-limiters/:id')
  async getRateLimitRule(@Param('id') id: string) {
    const rule = await this.dbService.getRateLimitRule(id);
    if (!rule) {
      throw new HttpException('Rate limit rule not found', HttpStatus.NOT_FOUND);
    }
    return rule;
  }

  @Post('rate-limiters')
  async createRateLimitRule(@Body() body: any) {
    if (!body.name || !body.endpoint) {
      throw new HttpException('Name and endpoint are required', HttpStatus.BAD_REQUEST);
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

  @Put('rate-limiters/:id')
  async updateRateLimitRule(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const updated = await this.dbService.updateRateLimitRule(id, body);
    if (!updated) {
      throw new HttpException('Rate limit rule not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  @Delete('rate-limiters/:id')
  async deleteRateLimitRule(@Param('id') id: string) {
    const deleted = await this.dbService.deleteRateLimitRule(id);
    if (!deleted) {
      throw new HttpException('Rate limit rule not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }

  @Post('rate-limiters/:id/reset')
  async resetRateLimiter(@Param('id') id: string) {
    await this.rateLimiterService.resetRule(id);
    return { success: true };
  }

  @Get('isolations')
  async getAllIsolationConfigs() {
    const configs = await this.dbService.getIsolationConfigs();
    return configs;
  }

  @Get('isolations/:id')
  async getIsolationConfig(@Param('id') id: string) {
    const config = await this.dbService.getIsolationConfig(id);
    if (!config) {
      throw new HttpException('Isolation config not found', HttpStatus.NOT_FOUND);
    }
    return config;
  }

  @Post('isolations')
  async createIsolationConfig(@Body() body: any) {
    if (!body.name || !body.serviceName) {
      throw new HttpException('Name and serviceName are required', HttpStatus.BAD_REQUEST);
    }

    const newConfig = await this.dbService.createIsolationConfig({
      name: body.name,
      serviceName: body.serviceName,
      level: body.level ?? IsolationLevel.BULKHEAD,
      maxConcurrent: body.maxConcurrent ?? 20,
      queueSize: body.queueSize ?? 100,
      timeout: body.timeout ?? 5000,
      enabled: body.enabled ?? true,
    });

    return newConfig;
  }

  @Put('isolations/:id')
  async updateIsolationConfig(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const updated = await this.dbService.updateIsolationConfig(id, body);
    if (!updated) {
      throw new HttpException('Isolation config not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  @Delete('isolations/:id')
  async deleteIsolationConfig(@Param('id') id: string) {
    const deleted = await this.dbService.deleteIsolationConfig(id);
    if (!deleted) {
      throw new HttpException('Isolation config not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }

  @Post('isolations/:id/reset')
  async resetIsolation(@Param('id') id: string) {
    await this.isolationService.resetIsolation(id);
    return { success: true };
  }
}
