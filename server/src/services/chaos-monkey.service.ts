import { Injectable, OnModuleInit } from '@nestjs/common';
import { JsonDatabaseService } from './json-database.service';
import { ChaosExperiment, ChaosType } from '../types';

interface ActiveExperiment {
  experiment: ChaosExperiment;
  interval: NodeJS.Timeout | null;
}

@Injectable()
export class ChaosMonkeyService implements OnModuleInit {
  private activeExperiments: Map<string, ActiveExperiment> = new Map();

  constructor(private readonly dbService: JsonDatabaseService) {}

  async onModuleInit() {
    const experiments = await this.dbService.getChaosExperiments();
    for (const exp of experiments) {
      if (exp.status === 'running') {
        await this.startExperiment(exp.id);
      }
    }
  }

  async startExperiment(experimentId: string): Promise<ChaosExperiment | null> {
    const experiment = await this.dbService.getChaosExperiment(experimentId);
    if (!experiment) return null;

    if (experiment.status === 'running') {
      return experiment;
    }

    const updatedExperiment = await this.dbService.updateChaosExperiment(experimentId, {
      status: 'running',
      startTime: Date.now(),
    });

    if (!updatedExperiment) return null;

    const activeExp: ActiveExperiment = {
      experiment: updatedExperiment,
      interval: null,
    };

    if (updatedExperiment.duration > 0) {
      activeExp.interval = setTimeout(async () => {
        await this.stopExperiment(experimentId);
      }, updatedExperiment.duration);
    }

    this.activeExperiments.set(experimentId, activeExp);

    return updatedExperiment;
  }

  async stopExperiment(experimentId: string): Promise<ChaosExperiment | null> {
    const active = this.activeExperiments.get(experimentId);
    if (active && active.interval) {
      clearTimeout(active.interval);
    }

    this.activeExperiments.delete(experimentId);

    return this.dbService.updateChaosExperiment(experimentId, {
      status: 'completed',
    });
  }

  async pauseExperiment(experimentId: string): Promise<ChaosExperiment | null> {
    const active = this.activeExperiments.get(experimentId);
    if (active && active.interval) {
      clearTimeout(active.interval);
      active.interval = null;
    }

    return this.dbService.updateChaosExperiment(experimentId, {
      status: 'paused',
    });
  }

  async resumeExperiment(experimentId: string): Promise<ChaosExperiment | null> {
    const experiment = await this.dbService.getChaosExperiment(experimentId);
    if (!experiment || experiment.status !== 'paused') return null;

    const active = this.activeExperiments.get(experimentId);
    if (active) {
      if (experiment.duration > 0) {
        active.interval = setTimeout(async () => {
          await this.stopExperiment(experimentId);
        }, experiment.duration);
      }
    }

    return this.dbService.updateChaosExperiment(experimentId, {
      status: 'running',
    });
  }

  async applyChaos(endpoint: string, method: string): Promise<ChaosEffect | null> {
    for (const [, active] of this.activeExperiments) {
      const { experiment } = active;
      
      const endpointMatch = this.matchEndpoint(endpoint, experiment.targetEndpoint);
      const methodMatch = experiment.targetMethod === '*' || 
                         experiment.targetMethod.toUpperCase() === method.toUpperCase();

      if (endpointMatch && methodMatch) {
        if (Math.random() > experiment.probability) {
          continue;
        }

        return this.createChaosEffect(experiment);
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

  private createChaosEffect(experiment: ChaosExperiment): ChaosEffect {
    const intensity = experiment.intensity / 100;

    switch (experiment.type) {
      case ChaosType.LATENCY:
        const minLatency = 100 * intensity;
        const maxLatency = 5000 * intensity;
        return {
          type: 'latency',
          delay: Math.floor(minLatency + Math.random() * (maxLatency - minLatency)),
        };

      case ChaosType.EXCEPTION:
        return {
          type: 'exception',
          error: new Error(`Chaos Monkey: ${experiment.name}`),
        };

      case ChaosType.ABORT:
        return {
          type: 'abort',
          statusCode: 500 + Math.floor(Math.random() * 3),
        };

      case ChaosType.CPU_STRESS:
        return {
          type: 'cpu_stress',
          duration: Math.floor(1000 * intensity),
        };

      case ChaosType.MEMORY_STRESS:
        return {
          type: 'memory_stress',
          size: Math.floor(10 * 1024 * 1024 * intensity),
        };

      default:
        return {
          type: 'none',
        };
    }
  }

  async getActiveExperiments(): Promise<ChaosExperiment[]> {
    const experiments = await this.dbService.getChaosExperiments();
    return experiments.filter(e => e.status === 'running');
  }

  async getExperimentById(id: string): Promise<ChaosExperiment | undefined> {
    return this.dbService.getChaosExperiment(id);
  }

  async getAllExperiments(): Promise<ChaosExperiment[]> {
    return this.dbService.getChaosExperiments();
  }
}

export interface ChaosEffect {
  type: 'latency' | 'exception' | 'abort' | 'cpu_stress' | 'memory_stress' | 'none';
  delay?: number;
  error?: Error;
  statusCode?: number;
  duration?: number;
  size?: number;
}
