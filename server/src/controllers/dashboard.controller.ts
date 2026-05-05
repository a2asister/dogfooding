import { Controller, Get } from '@nestjs/common';
import { JsonDatabaseService } from '../services/json-database.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { RateLimiterService } from '../services/rate-limiter.service';
import { IsolationService } from '../services/isolation.service';
import { ChaosMonkeyService } from '../services/chaos-monkey.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dbService: JsonDatabaseService,
    private readonly circuitService: CircuitBreakerService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly isolationService: IsolationService,
    private readonly chaosService: ChaosMonkeyService,
  ) {}

  @Get('overview')
  async getOverview() {
    const circuits = await this.circuitService.getAllCircuitStates();
    const rules = await this.rateLimiterService.getAllRulesWithStates();
    const isolations = await this.isolationService.getAllIsolationsWithStates();
    const experiments = await this.chaosService.getAllExperiments();
    const metricsHistory = await this.dbService.getMetricsHistory(
      Date.now() - 3600000,
      Date.now(),
    );

    const openCircuits = circuits.filter(c => c.state.state === 'open').length;
    const halfOpenCircuits = circuits.filter(c => c.state.state === 'half_open').length;
    const closedCircuits = circuits.filter(c => c.state.state === 'closed').length;

    const runningExperiments = experiments.filter(e => e.status === 'running').length;
    const pausedExperiments = experiments.filter(e => e.status === 'paused').length;
    const completedExperiments = experiments.filter(e => e.status === 'completed').length;

    const totalActiveRequests = isolations.reduce(
      (sum, i) => sum + i.state.activeRequests,
      0,
    );
    const totalQueuedRequests = isolations.reduce(
      (sum, i) => sum + i.state.queuedRequests,
      0,
    );
    const totalRejectedRequests = isolations.reduce(
      (sum, i) => sum + i.state.rejectedRequests,
      0,
    );

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
    } else {
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

  @Get('metrics-history')
  async getMetricsHistory() {
    const oneHourAgo = Date.now() - 3600000;
    const history = await this.dbService.getMetricsHistory(oneHourAgo, Date.now());
    
    const metricsByTime = new Map<number, {
      calls: number;
      success: number;
      failure: number;
      avgResponse: number;
    }>();

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

      const bucket = metricsByTime.get(minuteBucket)!;
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

  @Get('circuit-breakers')
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

  @Get('rate-limiters')
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

  @Get('isolations')
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

  @Get('chaos-experiments')
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
}
