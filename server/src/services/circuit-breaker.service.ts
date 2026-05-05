import { Injectable } from '@nestjs/common';
import { JsonDatabaseService } from './json-database.service';
import {
  CircuitState,
  CircuitBreakerConfig,
  CircuitBreakerState,
  MetricsSnapshot,
} from '../types';

interface CallMetrics {
  duration: number;
  success: boolean;
  slow: boolean;
  timestamp: number;
}

interface SlidingWindowMetrics {
  calls: CallMetrics[];
  totalDuration: number;
}

interface CircuitInstance {
  config: CircuitBreakerConfig;
  state: CircuitBreakerState;
  slidingWindow: SlidingWindowMetrics;
  responseTimes: number[];
}

@Injectable()
export class CircuitBreakerService {
  private circuits: Map<string, CircuitInstance> = new Map();

  constructor(private readonly dbService: JsonDatabaseService) {}

  async initializeCircuits(): Promise<void> {
    const configs = await this.dbService.getCircuitConfigs();
    const states = await this.dbService.getCircuitStates();

    for (const config of configs) {
      const state = states.find(s => s.circuitId === config.id);
      if (state) {
        this.circuits.set(config.id, {
          config,
          state,
          slidingWindow: { calls: [], totalDuration: 0 },
          responseTimes: [],
        });
      }
    }
  }

  async execute<T>(
    circuitId: string,
    supplier: () => Promise<T>,
    fallback?: () => Promise<T>,
  ): Promise<T> {
    const circuit = this.circuits.get(circuitId);
    if (!circuit || !circuit.config.enabled) {
      return supplier();
    }

    const start = Date.now();

    if (!this.acquirePermission(circuit)) {
      await this.recordCall(circuit, start, false, true);
      if (fallback) {
        return fallback();
      }
      throw new Error(`Circuit ${circuit.config.name} is ${circuit.state.state}`);
    }

    try {
      const result = await supplier();
      const duration = Date.now() - start;
      const isSlow = duration > circuit.config.slowCallDurationThreshold;
      
      await this.recordCall(circuit, start, true, false, isSlow, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      await this.recordCall(circuit, start, false, false, false, duration);
      
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  private acquirePermission(circuit: CircuitInstance): boolean {
    const now = Date.now();

    switch (circuit.state.state) {
      case CircuitState.OPEN:
        if (now - circuit.state.lastStateTransitionTime >= circuit.config.waitDurationInOpenState) {
          this.transitionTo(circuit, CircuitState.HALF_OPEN);
          return true;
        }
        circuit.state.numberOfNotPermittedCalls++;
        return false;

      case CircuitState.HALF_OPEN:
        const allowedCalls = circuit.slidingWindow.calls.filter(
          c => c.timestamp > circuit.state.lastStateTransitionTime,
        ).length;
        return allowedCalls < circuit.config.permittedNumberOfCallsInHalfOpenState;

      case CircuitState.CLOSED:
      default:
        return true;
    }
  }

  private async recordCall(
    circuit: CircuitInstance,
    startTime: number,
    success: boolean,
    notPermitted: boolean,
    isSlow: boolean = false,
    duration: number = 0,
  ): Promise<void> {
    if (notPermitted) {
      circuit.state.numberOfNotPermittedCalls++;
      return;
    }

    const call: CallMetrics = {
      duration,
      success,
      slow: isSlow,
      timestamp: startTime,
    };

    circuit.slidingWindow.calls.push(call);
    circuit.slidingWindow.totalDuration += duration;
    circuit.responseTimes.push(duration);

    if (circuit.config.slidingWindowType === 'count_based') {
      while (circuit.slidingWindow.calls.length > circuit.config.slidingWindowSize) {
        const removed = circuit.slidingWindow.calls.shift();
        if (removed) {
          circuit.slidingWindow.totalDuration -= removed.duration;
        }
      }
    } else {
      const cutoff = startTime - circuit.config.slidingWindowSize;
      circuit.slidingWindow.calls = circuit.slidingWindow.calls.filter(
        c => c.timestamp > cutoff,
      );
      circuit.slidingWindow.totalDuration = circuit.slidingWindow.calls.reduce(
        (sum, c) => sum + c.duration,
        0,
      );
    }

    if (circuit.responseTimes.length > 100) {
      circuit.responseTimes = circuit.responseTimes.slice(-100);
    }

    if (success) {
      circuit.state.numberOfSuccessfulCalls++;
      if (circuit.state.state === CircuitState.HALF_OPEN) {
        const recentCalls = circuit.slidingWindow.calls.filter(
          c => c.timestamp > circuit.state.lastStateTransitionTime,
        );
        const successCount = recentCalls.filter(c => c.success).length;
        
        if (successCount >= circuit.config.permittedNumberOfCallsInHalfOpenState) {
          this.transitionTo(circuit, CircuitState.CLOSED);
        }
      }
    } else {
      circuit.state.numberOfFailedCalls++;
      circuit.state.lastFailureTime = startTime;
    }

    if (isSlow) {
      circuit.state.numberOfSlowCalls++;
    }

    this.updateFailureRates(circuit);
    this.checkThresholds(circuit);

    circuit.state.metrics = this.calculateMetrics(circuit);

    await this.dbService.updateCircuitState(circuit.config.id, circuit.state);
    await this.dbService.addMetricsSnapshot({ ...circuit.state.metrics });
  }

  private updateFailureRates(circuit: CircuitInstance): void {
    const calls = circuit.slidingWindow.calls;
    
    if (calls.length < circuit.config.minimumNumberOfCalls) {
      circuit.state.failureRate = 0;
      circuit.state.slowCallRate = 0;
      return;
    }

    const failureCount = calls.filter(c => !c.success).length;
    const slowCount = calls.filter(c => c.slow).length;

    circuit.state.failureRate = (failureCount / calls.length) * 100;
    circuit.state.slowCallRate = (slowCount / calls.length) * 100;
  }

  private checkThresholds(circuit: CircuitInstance): void {
    if (circuit.slidingWindow.calls.length < circuit.config.minimumNumberOfCalls) {
      return;
    }

    if (circuit.state.state === CircuitState.HALF_OPEN) {
      const recentCalls = circuit.slidingWindow.calls.filter(
        c => c.timestamp > circuit.state.lastStateTransitionTime,
      );
      const failures = recentCalls.filter(c => !c.success).length;
      
      if (failures > 0) {
        this.transitionTo(circuit, CircuitState.OPEN);
      }
      return;
    }

    if (circuit.state.state === CircuitState.CLOSED) {
      if (
        circuit.state.failureRate >= circuit.config.failureThreshold ||
        circuit.state.slowCallRate >= circuit.config.slowCallThreshold
      ) {
        this.transitionTo(circuit, CircuitState.OPEN);
      }
    }
  }

  private transitionTo(circuit: CircuitInstance, newState: CircuitState): void {
    circuit.state.state = newState;
    circuit.state.lastStateTransitionTime = Date.now();
    circuit.slidingWindow.calls = [];
    circuit.slidingWindow.totalDuration = 0;
  }

  private calculateMetrics(circuit: CircuitInstance): MetricsSnapshot {
    const calls = circuit.slidingWindow.calls;
    const responseTimes = [...circuit.responseTimes].sort((a, b) => a - b);

    const totalCalls = calls.length;
    const successCount = calls.filter(c => c.success).length;
    const failureCount = calls.filter(c => !c.success).length;
    const slowCallCount = calls.filter(c => c.slow).length;
    
    const averageResponseTime = totalCalls > 0
      ? circuit.slidingWindow.totalDuration / totalCalls
      : 0;

    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    return {
      totalCalls,
      successCount,
      failureCount,
      slowCallCount,
      timeoutCount: 0,
      averageResponseTime: Math.round(averageResponseTime),
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      timestamp: Date.now(),
    };
  }

  async resetCircuit(circuitId: string): Promise<void> {
    const circuit = this.circuits.get(circuitId);
    if (!circuit) return;

    circuit.state.state = CircuitState.CLOSED;
    circuit.state.failureRate = 0;
    circuit.state.slowCallRate = 0;
    circuit.state.numberOfSuccessfulCalls = 0;
    circuit.state.numberOfFailedCalls = 0;
    circuit.state.numberOfSlowCalls = 0;
    circuit.state.numberOfNotPermittedCalls = 0;
    circuit.state.lastStateTransitionTime = Date.now();
    circuit.slidingWindow.calls = [];
    circuit.slidingWindow.totalDuration = 0;
    circuit.responseTimes = [];

    await this.dbService.updateCircuitState(circuitId, circuit.state);
  }

  async forceOpen(circuitId: string): Promise<void> {
    const circuit = this.circuits.get(circuitId);
    if (!circuit) return;

    this.transitionTo(circuit, CircuitState.OPEN);
    await this.dbService.updateCircuitState(circuitId, circuit.state);
  }

  async forceClosed(circuitId: string): Promise<void> {
    const circuit = this.circuits.get(circuitId);
    if (!circuit) return;

    this.transitionTo(circuit, CircuitState.CLOSED);
    await this.dbService.updateCircuitState(circuitId, circuit.state);
  }

  async getCircuitState(circuitId: string): Promise<CircuitBreakerState | null> {
    return this.dbService.getCircuitState(circuitId) || null;
  }

  async getAllCircuitStates(): Promise<{ config: CircuitBreakerConfig; state: CircuitBreakerState }[]> {
    const configs = await this.dbService.getCircuitConfigs();
    const states = await this.dbService.getCircuitStates();

    return configs
      .map(config => {
        const state = states.find(s => s.circuitId === config.id);
        return state ? { config, state } : null;
      })
      .filter((item): item is { config: CircuitBreakerConfig; state: CircuitBreakerState } => item !== null);
  }
}
