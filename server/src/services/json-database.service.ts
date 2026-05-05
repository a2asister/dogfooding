import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  DatabaseSchema, 
  CircuitBreakerConfig, 
  CircuitBreakerState, 
  RateLimitRule, 
  RateLimitState, 
  ChaosExperiment, 
  IsolationConfig, 
  IsolationState,
  MetricsSnapshot,
  CircuitState,
  IsolationLevel,
  ChaosType,
} from '../types';

@Injectable()
export class JsonDatabaseService implements OnModuleInit {
  private readonly dbPath: string;
  private data: DatabaseSchema;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'db.json');
    this.data = this.getDefaultData();
  }

  async onModuleInit() {
    await this.ensureDataDirectory();
    await this.loadData();
  }

  private async ensureDataDirectory(): Promise<void> {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private getDefaultData(): DatabaseSchema {
    const defaultCircuitId = uuidv4();
    const defaultRuleId = uuidv4();
    const defaultIsolationId = uuidv4();
    const defaultExperimentId = uuidv4();

    return {
      circuitConfigs: [
        {
          id: defaultCircuitId,
          name: '用户服务熔断器',
          failureThreshold: 50,
          slowCallThreshold: 50,
          slowCallDurationThreshold: 1000,
          waitDurationInOpenState: 30000,
          permittedNumberOfCallsInHalfOpenState: 3,
          slidingWindowType: 'count_based',
          slidingWindowSize: 10,
          minimumNumberOfCalls: 5,
          enabled: true,
          isolationLevel: IsolationLevel.SEMAPHORE,
          maxConcurrentCalls: 10,
        },
      ],
      circuitStates: [
        {
          circuitId: defaultCircuitId,
          state: CircuitState.CLOSED,
          failureRate: 0,
          slowCallRate: 0,
          numberOfSuccessfulCalls: 0,
          numberOfFailedCalls: 0,
          numberOfSlowCalls: 0,
          numberOfNotPermittedCalls: 0,
          lastFailureTime: 0,
          lastStateTransitionTime: Date.now(),
          metrics: {
            totalCalls: 0,
            successCount: 0,
            failureCount: 0,
            slowCallCount: 0,
            timeoutCount: 0,
            averageResponseTime: 0,
            p95ResponseTime: 0,
            p99ResponseTime: 0,
            timestamp: Date.now(),
          },
        },
      ],
      rateLimitRules: [
        {
          id: defaultRuleId,
          name: 'API 全局限流',
          endpoint: '/api/*',
          method: '*',
          limitType: 'token_bucket',
          limit: 100,
          windowSize: 60000,
          burstLimit: 50,
          adaptive: true,
          minLimit: 20,
          maxLimit: 200,
          targetLatency: 200,
          enabled: true,
        },
      ],
      rateLimitStates: [
        {
          ruleId: defaultRuleId,
          currentLimit: 100,
          currentWindow: 0,
          tokens: 100,
          requestsInWindow: 0,
          lastRefillTime: Date.now(),
          adaptiveAdjustments: 0,
        },
      ],
      chaosExperiments: [
        {
          id: defaultExperimentId,
          name: '延迟注入演练',
          description: '为用户服务接口注入随机延迟',
          type: ChaosType.LATENCY,
          targetEndpoint: '/api/users/*',
          targetMethod: 'GET',
          intensity: 50,
          duration: 60000,
          probability: 0.3,
          startTime: null,
          status: 'idle',
        },
      ],
      isolationConfigs: [
        {
          id: defaultIsolationId,
          name: '订单服务隔离',
          serviceName: 'order-service',
          level: IsolationLevel.BULKHEAD,
          maxConcurrent: 20,
          queueSize: 100,
          timeout: 5000,
          enabled: true,
        },
      ],
      isolationStates: [
        {
          configId: defaultIsolationId,
          activeRequests: 0,
          queuedRequests: 0,
          rejectedRequests: 0,
          timeouts: 0,
          lastActiveTime: Date.now(),
        },
      ],
      metricsHistory: [],
    };
  }

  private async loadData(): Promise<void> {
    try {
      if (fs.existsSync(this.dbPath)) {
        const rawData = fs.readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(rawData);
      } else {
        this.data = this.getDefaultData();
        await this.saveData();
      }
    } catch (error) {
      console.error('Failed to load database:', error);
      this.data = this.getDefaultData();
    }
  }

  private async saveData(): Promise<void> {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }

  async getCircuitConfigs(): Promise<CircuitBreakerConfig[]> {
    return [...this.data.circuitConfigs];
  }

  async getCircuitConfig(id: string): Promise<CircuitBreakerConfig | undefined> {
    return this.data.circuitConfigs.find(c => c.id === id);
  }

  async createCircuitConfig(config: Omit<CircuitBreakerConfig, 'id'>): Promise<CircuitBreakerConfig> {
    const newConfig = { ...config, id: uuidv4() };
    this.data.circuitConfigs.push(newConfig);
    
    const initialState: CircuitBreakerState = {
      circuitId: newConfig.id,
      state: CircuitState.CLOSED,
      failureRate: 0,
      slowCallRate: 0,
      numberOfSuccessfulCalls: 0,
      numberOfFailedCalls: 0,
      numberOfSlowCalls: 0,
      numberOfNotPermittedCalls: 0,
      lastFailureTime: 0,
      lastStateTransitionTime: Date.now(),
      metrics: {
        totalCalls: 0,
        successCount: 0,
        failureCount: 0,
        slowCallCount: 0,
        timeoutCount: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        timestamp: Date.now(),
      },
    };
    this.data.circuitStates.push(initialState);
    
    await this.saveData();
    return newConfig;
  }

  async updateCircuitConfig(id: string, updates: Partial<CircuitBreakerConfig>): Promise<CircuitBreakerConfig | null> {
    const index = this.data.circuitConfigs.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.data.circuitConfigs[index] = { ...this.data.circuitConfigs[index], ...updates };
    await this.saveData();
    return this.data.circuitConfigs[index];
  }

  async deleteCircuitConfig(id: string): Promise<boolean> {
    const configIndex = this.data.circuitConfigs.findIndex(c => c.id === id);
    const stateIndex = this.data.circuitStates.findIndex(s => s.circuitId === id);
    
    if (configIndex === -1) return false;
    
    this.data.circuitConfigs.splice(configIndex, 1);
    if (stateIndex !== -1) {
      this.data.circuitStates.splice(stateIndex, 1);
    }
    await this.saveData();
    return true;
  }

  async getCircuitStates(): Promise<CircuitBreakerState[]> {
    return [...this.data.circuitStates];
  }

  async getCircuitState(circuitId: string): Promise<CircuitBreakerState | undefined> {
    return this.data.circuitStates.find(s => s.circuitId === circuitId);
  }

  async updateCircuitState(circuitId: string, updates: Partial<CircuitBreakerState>): Promise<CircuitBreakerState | null> {
    const index = this.data.circuitStates.findIndex(s => s.circuitId === circuitId);
    if (index === -1) return null;
    
    this.data.circuitStates[index] = { ...this.data.circuitStates[index], ...updates };
    await this.saveData();
    return this.data.circuitStates[index];
  }

  async getRateLimitRules(): Promise<RateLimitRule[]> {
    return [...this.data.rateLimitRules];
  }

  async getRateLimitRule(id: string): Promise<RateLimitRule | undefined> {
    return this.data.rateLimitRules.find(r => r.id === id);
  }

  async createRateLimitRule(rule: Omit<RateLimitRule, 'id'>): Promise<RateLimitRule> {
    const newRule = { ...rule, id: uuidv4() };
    this.data.rateLimitRules.push(newRule);
    
    const initialState: RateLimitState = {
      ruleId: newRule.id,
      currentLimit: newRule.limit,
      currentWindow: 0,
      tokens: newRule.limit,
      requestsInWindow: 0,
      lastRefillTime: Date.now(),
      adaptiveAdjustments: 0,
    };
    this.data.rateLimitStates.push(initialState);
    
    await this.saveData();
    return newRule;
  }

  async updateRateLimitRule(id: string, updates: Partial<RateLimitRule>): Promise<RateLimitRule | null> {
    const index = this.data.rateLimitRules.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    this.data.rateLimitRules[index] = { ...this.data.rateLimitRules[index], ...updates };
    await this.saveData();
    return this.data.rateLimitRules[index];
  }

  async deleteRateLimitRule(id: string): Promise<boolean> {
    const ruleIndex = this.data.rateLimitRules.findIndex(r => r.id === id);
    const stateIndex = this.data.rateLimitStates.findIndex(s => s.ruleId === id);
    
    if (ruleIndex === -1) return false;
    
    this.data.rateLimitRules.splice(ruleIndex, 1);
    if (stateIndex !== -1) {
      this.data.rateLimitStates.splice(stateIndex, 1);
    }
    await this.saveData();
    return true;
  }

  async getRateLimitStates(): Promise<RateLimitState[]> {
    return [...this.data.rateLimitStates];
  }

  async getRateLimitState(ruleId: string): Promise<RateLimitState | undefined> {
    return this.data.rateLimitStates.find(s => s.ruleId === ruleId);
  }

  async updateRateLimitState(ruleId: string, updates: Partial<RateLimitState>): Promise<RateLimitState | null> {
    const index = this.data.rateLimitStates.findIndex(s => s.ruleId === ruleId);
    if (index === -1) return null;
    
    this.data.rateLimitStates[index] = { ...this.data.rateLimitStates[index], ...updates };
    await this.saveData();
    return this.data.rateLimitStates[index];
  }

  async getChaosExperiments(): Promise<ChaosExperiment[]> {
    return [...this.data.chaosExperiments];
  }

  async getChaosExperiment(id: string): Promise<ChaosExperiment | undefined> {
    return this.data.chaosExperiments.find(e => e.id === id);
  }

  async createChaosExperiment(experiment: Omit<ChaosExperiment, 'id' | 'startTime' | 'status'>): Promise<ChaosExperiment> {
    const newExperiment: ChaosExperiment = {
      ...experiment,
      id: uuidv4(),
      startTime: null,
      status: 'idle',
    };
    this.data.chaosExperiments.push(newExperiment);
    await this.saveData();
    return newExperiment;
  }

  async updateChaosExperiment(id: string, updates: Partial<ChaosExperiment>): Promise<ChaosExperiment | null> {
    const index = this.data.chaosExperiments.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    this.data.chaosExperiments[index] = { ...this.data.chaosExperiments[index], ...updates };
    await this.saveData();
    return this.data.chaosExperiments[index];
  }

  async deleteChaosExperiment(id: string): Promise<boolean> {
    const index = this.data.chaosExperiments.findIndex(e => e.id === id);
    if (index === -1) return false;
    
    this.data.chaosExperiments.splice(index, 1);
    await this.saveData();
    return true;
  }

  async getIsolationConfigs(): Promise<IsolationConfig[]> {
    return [...this.data.isolationConfigs];
  }

  async getIsolationConfig(id: string): Promise<IsolationConfig | undefined> {
    return this.data.isolationConfigs.find(c => c.id === id);
  }

  async createIsolationConfig(config: Omit<IsolationConfig, 'id'>): Promise<IsolationConfig> {
    const newConfig = { ...config, id: uuidv4() };
    this.data.isolationConfigs.push(newConfig);
    
    const initialState: IsolationState = {
      configId: newConfig.id,
      activeRequests: 0,
      queuedRequests: 0,
      rejectedRequests: 0,
      timeouts: 0,
      lastActiveTime: Date.now(),
    };
    this.data.isolationStates.push(initialState);
    
    await this.saveData();
    return newConfig;
  }

  async updateIsolationConfig(id: string, updates: Partial<IsolationConfig>): Promise<IsolationConfig | null> {
    const index = this.data.isolationConfigs.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.data.isolationConfigs[index] = { ...this.data.isolationConfigs[index], ...updates };
    await this.saveData();
    return this.data.isolationConfigs[index];
  }

  async deleteIsolationConfig(id: string): Promise<boolean> {
    const configIndex = this.data.isolationConfigs.findIndex(c => c.id === id);
    const stateIndex = this.data.isolationStates.findIndex(s => s.configId === id);
    
    if (configIndex === -1) return false;
    
    this.data.isolationConfigs.splice(configIndex, 1);
    if (stateIndex !== -1) {
      this.data.isolationStates.splice(stateIndex, 1);
    }
    await this.saveData();
    return true;
  }

  async getIsolationStates(): Promise<IsolationState[]> {
    return [...this.data.isolationStates];
  }

  async getIsolationState(configId: string): Promise<IsolationState | undefined> {
    return this.data.isolationStates.find(s => s.configId === configId);
  }

  async updateIsolationState(configId: string, updates: Partial<IsolationState>): Promise<IsolationState | null> {
    const index = this.data.isolationStates.findIndex(s => s.configId === configId);
    if (index === -1) return null;
    
    this.data.isolationStates[index] = { ...this.data.isolationStates[index], ...updates };
    await this.saveData();
    return this.data.isolationStates[index];
  }

  async addMetricsSnapshot(metrics: MetricsSnapshot): Promise<void> {
    this.data.metricsHistory.push(metrics);
    
    if (this.data.metricsHistory.length > 1000) {
      this.data.metricsHistory = this.data.metricsHistory.slice(-1000);
    }
    
    await this.saveData();
  }

  async getMetricsHistory(startTime?: number, endTime?: number): Promise<MetricsSnapshot[]> {
    let history = [...this.data.metricsHistory];
    
    if (startTime) {
      history = history.filter(m => m.timestamp >= startTime);
    }
    if (endTime) {
      history = history.filter(m => m.timestamp <= endTime);
    }
    
    return history;
  }
}
