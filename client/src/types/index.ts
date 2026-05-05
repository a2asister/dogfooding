export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export enum IsolationLevel {
  NONE = 'none',
  THREAD_POOL = 'thread_pool',
  SEMAPHORE = 'semaphore',
  BULKHEAD = 'bulkhead',
}

export enum ChaosType {
  LATENCY = 'latency',
  EXCEPTION = 'exception',
  ABORT = 'abort',
  CPU_STRESS = 'cpu_stress',
  MEMORY_STRESS = 'memory_stress',
}

export type ChaosStatus = 'idle' | 'running' | 'paused' | 'completed' | 'aborted';

export interface CircuitBreakerConfig {
  id: string;
  name: string;
  failureThreshold: number;
  slowCallThreshold: number;
  slowCallDurationThreshold: number;
  waitDurationInOpenState: number;
  permittedNumberOfCallsInHalfOpenState: number;
  slidingWindowType: 'count_based' | 'time_based';
  slidingWindowSize: number;
  minimumNumberOfCalls: number;
  enabled: boolean;
  isolationLevel: IsolationLevel;
  maxConcurrentCalls: number;
}

export interface CircuitBreakerState {
  circuitId: string;
  state: CircuitState;
  failureRate: number;
  slowCallRate: number;
  numberOfSuccessfulCalls: number;
  numberOfFailedCalls: number;
  numberOfSlowCalls: number;
  numberOfNotPermittedCalls: number;
  lastFailureTime: number;
  lastStateTransitionTime: number;
  metrics: MetricsSnapshot;
}

export interface MetricsSnapshot {
  totalCalls: number;
  successCount: number;
  failureCount: number;
  slowCallCount: number;
  timeoutCount: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  timestamp: number;
}

export interface RateLimitRule {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | '*';
  limitType: 'fixed_window' | 'sliding_window' | 'token_bucket' | 'leaky_bucket';
  limit: number;
  windowSize: number;
  burstLimit: number;
  adaptive: boolean;
  minLimit: number;
  maxLimit: number;
  targetLatency: number;
  enabled: boolean;
}

export interface RateLimitState {
  ruleId: string;
  currentLimit: number;
  currentWindow: number;
  tokens: number;
  requestsInWindow: number;
  lastRefillTime: number;
  adaptiveAdjustments: number;
}

export interface ChaosExperiment {
  id: string;
  name: string;
  description: string;
  type: ChaosType;
  targetEndpoint: string;
  targetMethod: string;
  intensity: number;
  duration: number;
  probability: number;
  startTime: number | null;
  status: 'idle' | 'running' | 'paused' | 'completed';
  targetService?: string;
  strength?: number;
  delay?: number;
  startedAt?: number;
  finishedAt?: number;
  elapsedTime?: number;
}

export interface IsolationConfig {
  id: string;
  name: string;
  serviceName: string;
  level: IsolationLevel;
  maxConcurrent: number;
  queueSize: number;
  timeout: number;
  enabled: boolean;
}

export interface IsolationState {
  configId: string;
  activeRequests: number;
  queuedRequests: number;
  rejectedRequests: number;
  timeouts: number;
  lastActiveTime: number;
}

export interface DashboardOverview {
  timestamp: number;
  circuitBreakers: {
    total: number;
    open: number;
    halfOpen: number;
    closed: number;
  };
  rateLimiters: {
    total: number;
    enabled: number;
    adaptive: number;
  };
  isolation: {
    total: number;
    activeRequests: number;
    queuedRequests: number;
    rejectedRequests: number;
  };
  chaosExperiments: {
    total: number;
    running: number;
    paused: number;
    completed: number;
  };
  metrics: {
    totalCalls: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    averageResponseTime: number;
  };
}

export interface CircuitBreakerListItem {
  id: string;
  name: string;
  enabled: boolean;
  state: CircuitState;
  failureRate: number;
  slowCallRate: number;
  metrics: MetricsSnapshot;
  config: {
    failureThreshold: number;
    slowCallThreshold: number;
    isolationLevel: IsolationLevel;
  };
}

export interface RateLimiterListItem {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  enabled: boolean;
  limitType: string;
  currentLimit: number;
  baseLimit: number;
  adaptive: boolean;
  remaining: number;
  requestsInWindow: number;
  adaptiveAdjustments: number;
}

export interface IsolationListItem {
  id: string;
  name: string;
  serviceName: string;
  enabled: boolean;
  level: IsolationLevel;
  maxConcurrent: number;
  activeRequests: number;
  queuedRequests: number;
  rejectedRequests: number;
  timeouts: number;
  utilization: number;
}

export interface ChaosExerciseListItem {
  id: string;
  name: string;
  description: string;
  type: ChaosType;
  targetEndpoint: string;
  targetMethod: string;
  intensity: number;
  duration: number;
  probability: number;
  startTime: number | null;
  status: 'idle' | 'running' | 'paused' | 'completed';
  elapsedTime: number;
  targetService?: string;
  strength?: number;
  startedAt?: number;
  finishedAt?: number;
}

export interface MetricsHistoryItem {
  timestamp: number;
  totalCalls: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  successRate: number;
}
