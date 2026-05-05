"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsolationService = void 0;
const common_1 = require("@nestjs/common");
const json_database_service_1 = require("./json-database.service");
let IsolationService = class IsolationService {
    constructor(dbService) {
        this.dbService = dbService;
        this.instances = new Map();
    }
    async initializeIsolations() {
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
    async acquire(configId) {
        const instance = this.instances.get(configId);
        if (!instance || !instance.config.enabled) {
            return { acquired: true, release: async () => { } };
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
            return new Promise((resolve) => {
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
                    resolve: (success) => {
                        clearTimeout(timeout);
                        if (success) {
                            resolve({
                                acquired: true,
                                release: async () => {
                                    await this.release(configId);
                                },
                            });
                        }
                        else {
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
    async release(configId) {
        const instance = this.instances.get(configId);
        if (!instance)
            return;
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
    async persistState(instance) {
        await this.dbService.updateIsolationState(instance.config.id, instance.state);
    }
    async getIsolationState(configId) {
        const instance = this.instances.get(configId);
        return instance ? instance.state : null;
    }
    async getAllIsolationsWithStates() {
        const configs = await this.dbService.getIsolationConfigs();
        const states = await this.dbService.getIsolationStates();
        return configs
            .map(config => {
            const state = states.find(s => s.configId === config.id);
            return state ? { config, state } : null;
        })
            .filter((item) => item !== null);
    }
    async resetIsolation(configId) {
        const instance = this.instances.get(configId);
        if (!instance)
            return;
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
};
exports.IsolationService = IsolationService;
exports.IsolationService = IsolationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_database_service_1.JsonDatabaseService])
], IsolationService);
//# sourceMappingURL=isolation.service.js.map