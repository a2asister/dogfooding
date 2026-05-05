import { Injectable } from '@nestjs/common';
import { JsonDatabaseService } from './json-database.service';
import { IsolationConfig, IsolationState, IsolationLevel } from '../types';

interface QueuedRequest {
  resolve: (value: boolean) => void;
  timestamp: number;
}

interface IsolationInstance {
  config: IsolationConfig;
  state: IsolationState;
  semaphore: number;
  requestQueue: QueuedRequest[];
}

@Injectable()
export class IsolationService {
  private instances: Map<string, IsolationInstance> = new Map();

  constructor(private readonly dbService: JsonDatabaseService) {}

  async initializeIsolations(): Promise<void> {
    const configs = await this.dbService.getIsolationConfigs();
    const states = await this.dbService.getIsolationStates();

    for (const config of configs) {
      const state = states.find(s => s.configId === config.id);
      if (state) {
        this.instances.set(config.id, {
          config,
          state,
          semaphore: config.maxConcurrent,
          requestQueue: [],
        });
      }
    }
  }

  async acquire(configId: string): Promise<AcquireResult> {
    const instance = this.instances.get(configId);
    if (!instance || !instance.config.enabled) {
      return { acquired: true, release: async () => {} };
    }

    if (instance.semaphore > 0) {
      instance.semaphore--;
      instance.state.activeRequests++;
      instance.state.lastActiveTime = Date.now();
      await this.persistState(instance);

      return {
        acquired: true,
        release: async () => {
          await this.release(configId);
        },
      };
    }

    if (instance.state.queuedRequests < instance.config.queueSize) {
      instance.state.queuedRequests++;
      await this.persistState(instance);

      return new Promise<AcquireResult>((resolve) => {
        const requestTimestamp = Date.now();
        const timeout = setTimeout(async () => {
          const idx = instance.requestQueue.findIndex(r => r.timestamp === requestTimestamp);
          if (idx !== -1) {
            instance.requestQueue.splice(idx, 1);
          }
          instance.state.queuedRequests--;
          instance.state.timeouts++;
          await this.persistState(instance);
          resolve({ acquired: false, reason: 'timeout' });
        }, instance.config.timeout);

        instance.requestQueue.push({
          resolve: (success: boolean) => {
            clearTimeout(timeout);
            if (success) {
              resolve({
                acquired: true,
                release: async () => {
                  await this.release(configId);
                },
              });
            } else {
              instance.state.queuedRequests--;
              this.persistState(instance);
              resolve({ acquired: false, reason: 'rejected' });
            }
          },
          timestamp: requestTimestamp,
        });
      });
    }

    instance.state.rejectedRequests++;
    await this.persistState(instance);
    return { acquired: false, reason: 'capacity_exceeded' };
  }

  private async release(configId: string): Promise<void> {
    const instance = this.instances.get(configId);
    if (!instance) return;

    instance.semaphore++;
    instance.state.activeRequests--;
    await this.persistState(instance);

    if (instance.requestQueue.length > 0 && instance.semaphore > 0) {
      const queued = instance.requestQueue.shift();
      if (queued) {
        instance.semaphore--;
        instance.state.activeRequests++;
        instance.state.queuedRequests--;
        await this.persistState(instance);
        queued.resolve(true);
      }
    }
  }

  private async persistState(instance: IsolationInstance): Promise<void> {
    await this.dbService.updateIsolationState(instance.config.id, instance.state);
  }

  async getIsolationState(configId: string): Promise<IsolationState | null> {
    const instance = this.instances.get(configId);
    return instance ? instance.state : null;
  }

  async getAllIsolationsWithStates(): Promise<{ config: IsolationConfig; state: IsolationState }[]> {
    const configs = await this.dbService.getIsolationConfigs();
    const states = await this.dbService.getIsolationStates();

    return configs
      .map(config => {
        const state = states.find(s => s.configId === config.id);
        return state ? { config, state } : null;
      })
      .filter((item): item is { config: IsolationConfig; state: IsolationState } => item !== null);
  }

  async resetIsolation(configId: string): Promise<void> {
    const instance = this.instances.get(configId);
    if (!instance) return;

    for (const queued of instance.requestQueue) {
      queued.resolve(false);
    }
    instance.requestQueue = [];

    instance.semaphore = instance.config.maxConcurrent;
    instance.state.activeRequests = 0;
    instance.state.queuedRequests = 0;
    instance.state.rejectedRequests = 0;
    instance.state.timeouts = 0;
    instance.state.lastActiveTime = Date.now();

    await this.persistState(instance);
  }
}

export interface AcquireResult {
  acquired: boolean;
  release?: () => Promise<void>;
  reason?: 'timeout' | 'rejected' | 'capacity_exceeded';
}
