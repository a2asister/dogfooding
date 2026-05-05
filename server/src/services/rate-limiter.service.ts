import { Injectable } from '@nestjs/common';
import { JsonDatabaseService } from './json-database.service';
import {
  RateLimitRule,
  RateLimitState,
} from '../types';

interface LimitCheckResult {
  allowed: boolean;
  currentLimit: number;
  remaining: number;
  resetTime: number;
}

interface RuleInstance {
  rule: RateLimitRule;
  state: RateLimitState;
  responseTimes: number[];
}

@Injectable()
export class RateLimiterService {
  private rules: Map<string, RuleInstance> = new Map();
  private lastAdjustmentTime: Map<string, number> = new Map();

  constructor(private readonly dbService: JsonDatabaseService) {}

  async initializeRules(): Promise<void> {
    const ruleConfigs = await this.dbService.getRateLimitRules();
    const states = await this.dbService.getRateLimitStates();

    for (const rule of ruleConfigs) {
      const state = states.find(s => s.ruleId === rule.id);
      if (state) {
        this.rules.set(rule.id, {
          rule,
          state,
          responseTimes: [],
        });
        this.lastAdjustmentTime.set(rule.id, Date.now());
      }
    }
  }

  async checkRateLimit(
    endpoint: string,
    method: string,
    responseTime?: number,
  ): Promise<LimitCheckResult> {
    const matchingRule = this.findMatchingRule(endpoint, method);
    
    if (!matchingRule || !matchingRule.rule.enabled) {
      return {
        allowed: true,
        currentLimit: Number.MAX_SAFE_INTEGER,
        remaining: Number.MAX_SAFE_INTEGER,
        resetTime: Date.now() + 60000,
      };
    }

    if (responseTime !== undefined) {
      matchingRule.responseTimes.push(responseTime);
      if (matchingRule.responseTimes.length > 100) {
        matchingRule.responseTimes = matchingRule.responseTimes.slice(-100);
      }
    }

    if (matchingRule.rule.adaptive) {
      this.adjustLimitDynamically(matchingRule);
    }

    const result = this.consumeToken(matchingRule);
    await this.dbService.updateRateLimitState(matchingRule.rule.id, matchingRule.state);
    
    return result;
  }

  private findMatchingRule(endpoint: string, method: string): RuleInstance | null {
    for (const [, instance] of this.rules) {
      const { rule } = instance;
      
      const endpointMatch = this.matchEndpoint(endpoint, rule.endpoint);
      const methodMatch = rule.method === '*' || rule.method.toUpperCase() === method.toUpperCase();
      
      if (endpointMatch && methodMatch) {
        return instance;
      }
    }
    return null;
  }

  private matchEndpoint(endpoint: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(endpoint);
  }

  private consumeToken(instance: RuleInstance): LimitCheckResult {
    const { rule, state } = instance;
    const now = Date.now();

    switch (rule.limitType) {
      case 'fixed_window':
        return this.handleFixedWindow(instance, now);
      
      case 'sliding_window':
        return this.handleSlidingWindow(instance, now);
      
      case 'token_bucket':
        return this.handleTokenBucket(instance, now);
      
      case 'leaky_bucket':
        return this.handleLeakyBucket(instance, now);
      
      default:
        return this.handleTokenBucket(instance, now);
    }
  }

  private handleFixedWindow(instance: RuleInstance, now: number): LimitCheckResult {
    const { rule, state } = instance;
    const windowStart = Math.floor(now / rule.windowSize) * rule.windowSize;

    if (windowStart !== state.currentWindow) {
      state.currentWindow = windowStart;
      state.requestsInWindow = 0;
    }

    const allowed = state.requestsInWindow < state.currentLimit;
    if (allowed) {
      state.requestsInWindow++;
    }

    const resetTime = windowStart + rule.windowSize;
    const remaining = Math.max(0, state.currentLimit - state.requestsInWindow);

    return {
      allowed,
      currentLimit: state.currentLimit,
      remaining,
      resetTime,
    };
  }

  private handleSlidingWindow(instance: RuleInstance, now: number): LimitCheckResult {
    const { rule, state } = instance;
    const cutoff = now - rule.windowSize;

    if (now - state.lastRefillTime > 1000) {
      const elapsed = now - state.lastRefillTime;
      const tokensToAdd = (state.currentLimit / rule.windowSize) * elapsed;
      state.tokens = Math.min(state.currentLimit, state.tokens + tokensToAdd);
      state.lastRefillTime = now;
    }

    const allowed = state.requestsInWindow < state.currentLimit;
    if (allowed) {
      state.requestsInWindow++;
    }

    const resetTime = cutoff + rule.windowSize;
    const remaining = Math.max(0, state.currentLimit - state.requestsInWindow);

    return {
      allowed,
      currentLimit: state.currentLimit,
      remaining,
      resetTime,
    };
  }

  private handleTokenBucket(instance: RuleInstance, now: number): LimitCheckResult {
    const { rule, state } = instance;
    const elapsed = now - state.lastRefillTime;

    if (elapsed > 0) {
      const refillRate = state.currentLimit / (rule.windowSize / 1000);
      const tokensToAdd = refillRate * (elapsed / 1000);
      state.tokens = Math.min(state.currentLimit + rule.burstLimit, state.tokens + tokensToAdd);
      state.lastRefillTime = now;
    }

    const allowed = state.tokens >= 1;
    if (allowed) {
      state.tokens--;
    }

    const remaining = Math.floor(state.tokens);
    const resetTime = now + Math.ceil((state.currentLimit - state.tokens) * (rule.windowSize / state.currentLimit));

    return {
      allowed,
      currentLimit: state.currentLimit,
      remaining,
      resetTime,
    };
  }

  private handleLeakyBucket(instance: RuleInstance, now: number): LimitCheckResult {
    const { rule, state } = instance;
    const elapsed = now - state.lastRefillTime;

    if (elapsed > 0) {
      const leakRate = state.currentLimit / (rule.windowSize / 1000);
      const tokensToLeak = leakRate * (elapsed / 1000);
      state.tokens = Math.max(0, state.tokens - tokensToLeak);
      state.lastRefillTime = now;
    }

    const allowed = state.tokens + 1 <= state.currentLimit + rule.burstLimit;
    if (allowed) {
      state.tokens++;
    }

    const remaining = Math.floor(state.currentLimit + rule.burstLimit - state.tokens);
    const resetTime = now + Math.ceil(state.tokens * (rule.windowSize / state.currentLimit));

    return {
      allowed,
      currentLimit: state.currentLimit,
      remaining,
      resetTime,
    };
  }

  private adjustLimitDynamically(instance: RuleInstance): void {
    const { rule, state, responseTimes } = instance;
    const now = Date.now();
    const lastAdjust = this.lastAdjustmentTime.get(rule.id) || 0;

    if (now - lastAdjust < 5000) {
      return;
    }

    if (responseTimes.length === 0) {
      return;
    }

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const adjustmentFactor = 0.1;

    if (avgResponseTime > rule.targetLatency * 1.5) {
      const newLimit = Math.max(rule.minLimit, state.currentLimit * (1 - adjustmentFactor));
      if (newLimit !== state.currentLimit) {
        state.currentLimit = Math.ceil(newLimit);
        state.adaptiveAdjustments++;
        this.lastAdjustmentTime.set(rule.id, now);
      }
    } else if (avgResponseTime < rule.targetLatency * 0.5) {
      const newLimit = Math.min(rule.maxLimit, state.currentLimit * (1 + adjustmentFactor));
      if (newLimit !== state.currentLimit) {
        state.currentLimit = Math.ceil(newLimit);
        state.adaptiveAdjustments++;
        this.lastAdjustmentTime.set(rule.id, now);
      }
    }
  }

  async getRuleState(ruleId: string): Promise<RateLimitState | null> {
    const instance = this.rules.get(ruleId);
    return instance ? instance.state : null;
  }

  async getAllRulesWithStates(): Promise<{ rule: RateLimitRule; state: RateLimitState }[]> {
    const rules = await this.dbService.getRateLimitRules();
    const states = await this.dbService.getRateLimitStates();

    return rules
      .map(rule => {
        const state = states.find(s => s.ruleId === rule.id);
        return state ? { rule, state } : null;
      })
      .filter((item): item is { rule: RateLimitRule; state: RateLimitState } => item !== null);
  }

  async resetRule(ruleId: string): Promise<void> {
    const instance = this.rules.get(ruleId);
    if (!instance) return;

    instance.state.currentLimit = instance.rule.limit;
    instance.state.tokens = instance.rule.limit;
    instance.state.requestsInWindow = 0;
    instance.state.adaptiveAdjustments = 0;
    instance.responseTimes = [];

    await this.dbService.updateRateLimitState(ruleId, instance.state);
  }
}
