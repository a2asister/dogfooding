import axios from 'axios';
import type {
  DashboardOverview,
  CircuitBreakerListItem,
  RateLimiterListItem,
  IsolationListItem,
  ChaosExperimentListItem,
  MetricsHistoryItem,
  CircuitBreakerConfig,
  RateLimitRule,
  IsolationConfig,
  ChaosExperiment,
  ChaosType,
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardApi = {
  getOverview: (): Promise<DashboardOverview> => 
    api.get('/dashboard/overview').then(res => res.data),
  
  getMetricsHistory: (): Promise<MetricsHistoryItem[]> =>
    api.get('/dashboard/metrics-history').then(res => res.data),
  
  getCircuitBreakers: (): Promise<CircuitBreakerListItem[]> =>
    api.get('/dashboard/circuit-breakers').then(res => res.data),
  
  getRateLimiters: (): Promise<RateLimiterListItem[]> =>
    api.get('/dashboard/rate-limiters').then(res => res.data),
  
  getIsolations: (): Promise<IsolationListItem[]> =>
    api.get('/dashboard/isolations').then(res => res.data),
  
  getChaosExercises: (): Promise<ChaosExperimentListItem[]> =>
    api.get('/dashboard/chaos-experiments').then(res => res.data),
};

export const configApi = {
  getCircuitConfigs: (): Promise<CircuitBreakerConfig[]> =>
    api.get('/config/circuit-breakers').then(res => res.data),
  
  getCircuitConfig: (id: string): Promise<CircuitBreakerConfig> =>
    api.get(`/config/circuit-breakers/${id}`).then(res => res.data),
  
  createCircuitConfig: (data: Omit<CircuitBreakerConfig, 'id'>): Promise<CircuitBreakerConfig> =>
    api.post('/config/circuit-breakers', data).then(res => res.data),
  
  updateCircuitConfig: (id: string, data: Partial<CircuitBreakerConfig>): Promise<CircuitBreakerConfig> =>
    api.put(`/config/circuit-breakers/${id}`, data).then(res => res.data),
  
  deleteCircuitConfig: (id: string): Promise<void> =>
    api.delete(`/config/circuit-breakers/${id}`).then(res => res.data),
  
  resetCircuitBreaker: (id: string): Promise<void> =>
    api.post(`/config/circuit-breakers/${id}/reset`).then(res => res.data),
  
  forceOpenCircuit: (id: string): Promise<void> =>
    api.post(`/config/circuit-breakers/${id}/force-open`).then(res => res.data),
  
  forceClosedCircuit: (id: string): Promise<void> =>
    api.post(`/config/circuit-breakers/${id}/force-closed`).then(res => res.data),

  getRateLimitRules: (): Promise<RateLimitRule[]> =>
    api.get('/config/rate-limiters').then(res => res.data),
  
  getRateLimitRule: (id: string): Promise<RateLimitRule> =>
    api.get(`/config/rate-limiters/${id}`).then(res => res.data),
  
  createRateLimitRule: (data: Omit<RateLimitRule, 'id'>): Promise<RateLimitRule> =>
    api.post('/config/rate-limiters', data).then(res => res.data),
  
  updateRateLimitRule: (id: string, data: Partial<RateLimitRule>): Promise<RateLimitRule> =>
    api.put(`/config/rate-limiters/${id}`, data).then(res => res.data),
  
  deleteRateLimitRule: (id: string): Promise<void> =>
    api.delete(`/config/rate-limiters/${id}`).then(res => res.data),
  
  resetRateLimiter: (id: string): Promise<void> =>
    api.post(`/config/rate-limiters/${id}/reset`).then(res => res.data),

  getIsolationConfigs: (): Promise<IsolationConfig[]> =>
    api.get('/config/isolations').then(res => res.data),
  
  getIsolationConfig: (id: string): Promise<IsolationConfig> =>
    api.get(`/config/isolations/${id}`).then(res => res.data),
  
  createIsolationConfig: (data: Omit<IsolationConfig, 'id'>): Promise<IsolationConfig> =>
    api.post('/config/isolations', data).then(res => res.data),
  
  updateIsolationConfig: (id: string, data: Partial<IsolationConfig>): Promise<IsolationConfig> =>
    api.put(`/config/isolations/${id}`, data).then(res => res.data),
  
  deleteIsolationConfig: (id: string): Promise<void> =>
    api.delete(`/config/isolations/${id}`).then(res => res.data),
  
  resetIsolation: (id: string): Promise<void> =>
    api.post(`/config/isolations/${id}/reset`).then(res => res.data),
};

export const chaosApi = {
  getExperiments: (): Promise<ChaosExperiment[]> =>
    api.get('/chaos/experiments').then(res => res.data),
  
  getExperiment: (id: string): Promise<ChaosExperiment> =>
    api.get(`/chaos/experiments/${id}`).then(res => res.data),
  
  createExperiment: (data: Omit<ChaosExperiment, 'id' | 'startTime' | 'status'>): Promise<ChaosExperiment> =>
    api.post('/chaos/experiments', data).then(res => res.data),
  
  updateExperiment: (id: string, data: Partial<ChaosExperiment>): Promise<ChaosExperiment> =>
    api.put(`/chaos/experiments/${id}`, data).then(res => res.data),
  
  deleteExperiment: (id: string): Promise<void> =>
    api.delete(`/chaos/experiments/${id}`).then(res => res.data),
  
  startExperiment: (id: string): Promise<{ success: boolean; experiment: ChaosExperiment }> =>
    api.post(`/chaos/experiments/${id}/start`).then(res => res.data),
  
  stopExperiment: (id: string): Promise<{ success: boolean; experiment: ChaosExperiment }> =>
    api.post(`/chaos/experiments/${id}/stop`).then(res => res.data),
  
  pauseExperiment: (id: string): Promise<{ success: boolean; experiment: ChaosExperiment }> =>
    api.post(`/chaos/experiments/${id}/pause`).then(res => res.data),
  
  resumeExperiment: (id: string): Promise<{ success: boolean; experiment: ChaosExperiment }> =>
    api.post(`/chaos/experiments/${id}/resume`).then(res => res.data),
  
  getActiveExperiments: (): Promise<ChaosExperiment[]> =>
    api.get('/chaos/active').then(res => res.data),
  
  getChaosTypes: (): Promise<ChaosType[]> =>
    api.get('/chaos/types').then(res => res.data),

  create: (data: any): Promise<any> =>
    api.post('/chaos/experiments', data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/chaos/experiments/${id}`).then(res => res.data),
  
  start: (id: string): Promise<any> =>
    api.post(`/chaos/experiments/${id}/start`).then(res => res.data),
  
  stop: (id: string): Promise<any> =>
    api.post(`/chaos/experiments/${id}/stop`).then(res => res.data),
  
  pause: (id: string): Promise<any> =>
    api.post(`/chaos/experiments/${id}/pause`).then(res => res.data),
  
  resume: (id: string): Promise<any> =>
    api.post(`/chaos/experiments/${id}/resume`).then(res => res.data),
};

export const testApi = {
  testApiCall: (params?: {
    circuitId?: string;
    isolationId?: string;
    fail?: boolean;
    slow?: boolean;
    delay?: number;
  }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.circuitId) queryParams.append('circuitId', params.circuitId);
    if (params?.isolationId) queryParams.append('isolationId', params.isolationId);
    if (params?.fail) queryParams.append('fail', 'true');
    if (params?.slow) queryParams.append('slow', 'true');
    if (params?.delay) queryParams.append('delay', params.delay.toString());
    
    return api.get(`/test/api-call?${queryParams.toString()}`).then(res => res.data);
  },

  apiCall: (params?: {
    circuitId?: string;
    isolationId?: string;
    fail?: boolean;
    slow?: boolean;
    delay?: number;
  }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.circuitId) queryParams.append('circuitId', params.circuitId);
    if (params?.isolationId) queryParams.append('isolationId', params.isolationId);
    if (params?.fail) queryParams.append('fail', 'true');
    if (params?.slow) queryParams.append('slow', 'true');
    if (params?.delay) queryParams.append('delay', params.delay.toString());
    
    return api.get(`/test/api-call?${queryParams.toString()}`).then(res => res.data);
  },

  batchFail: (circuitId: string, count: number = 5): Promise<any> =>
    api.post(`/test/batch-fail?circuitId=${circuitId}&count=${count}`).then(res => res.data),

  isolationTest: (isolationId: string, delay?: number): Promise<any> => {
    const queryParams = new URLSearchParams();
    queryParams.append('isolationId', isolationId);
    if (delay) queryParams.append('delay', delay.toString());
    return api.get(`/test/isolation-test?${queryParams.toString()}`).then(res => res.data);
  },
};

export { api };
