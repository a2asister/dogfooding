import request from '../utils/request';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  env?: string;
}

export interface Host {
  id: number;
  hostname: string;
  ip: string;
  env: string;
  cpuCores: number;
  memoryTotal: number;
  diskTotal: number;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostMetric {
  id: number;
  hostId: number;
  cpuUsage: number;
  memoryUsage: number;
  memoryUsed: number;
  diskUsage: number;
  diskUsed: number;
  networkIn: number;
  networkOut: number;
  loadAverage: number;
  processCount: number;
  timestamp: string;
}

export interface Container {
  id: number;
  containerId: string;
  name: string;
  image: string;
  hostId: number;
  env: string;
  cpuLimit: number;
  memoryLimit: number;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContainerMetric {
  id: number;
  containerId: string;
  cpuUsage: number;
  memoryUsage: number;
  memoryUsed: number;
  networkIn: number;
  networkOut: number;
  diskRead: number;
  diskWrite: number;
  restartCount: number;
  timestamp: string;
}

export interface App {
  id: number;
  name: string;
  code: string;
  env: string;
  type: string;
  version: string;
  instanceCount: number;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppMetric {
  id: number;
  appCode: string;
  cpuUsage: number;
  memoryUsage: number;
  memoryUsed: number;
  requestCount: number;
  errorCount: number;
  errorRate: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  activeConnections: number;
  threadCount: number;
  heapUsed: number;
  heapMax: number;
  timestamp: string;
}

export interface Log {
  id: number;
  appCode: string;
  env: string;
  level: string;
  logger: string;
  thread: string;
  message: string;
  stackTrace: string;
  traceId: string;
  className: string;
  lineNumber: number;
  timestamp: string;
}

export interface AlertRule {
  id: number;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  duration: number;
  level: string;
  enabled: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertRecord {
  id: number;
  ruleId: number;
  ruleName: string;
  metric: string;
  currentValue: number;
  threshold: number;
  operator: string;
  level: string;
  status: string;
  details: string;
  handledBy: string;
  handleNote: string;
  createdAt: string;
  resolvedAt: string;
}

export interface Environment {
  id: number;
  name: string;
  code: string;
  description: string;
  sort: number;
  enabled: boolean;
}

export interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  role: string;
  enabled: boolean;
}

export const hostApi = {
  getList: (params?: PaginationParams) => request.get<any, { list: Host[]; total: number }>('/hosts', { params }),
  getAll: (params?: { env?: string }) => request.get<any, Host[]>('/hosts/all', { params }),
  getOverview: () => request.get<any, any>('/hosts/overview'),
  getMetrics: (hostId: number, params?: { startTime?: string; endTime?: string }) =>
    request.get<any, HostMetric[]>(`/hosts/${hostId}/metrics`, { params }),
  getLatestMetric: (hostId: number) => request.get<any, HostMetric>(`/hosts/${hostId}/metrics/latest`),
  create: (data: Partial<Host>) => request.post('/hosts', data),
  update: (id: number, data: Partial<Host>) => request.put(`/hosts/${id}`, data),
  delete: (id: number) => request.delete(`/hosts/${id}`),
};

export const containerApi = {
  getList: (params?: PaginationParams & { hostId?: string }) => request.get<any, { list: Container[]; total: number }>('/containers', { params }),
  getAll: (params?: { env?: string }) => request.get<any, Container[]>('/containers/all', { params }),
  getOverview: () => request.get<any, any>('/containers/overview'),
  getMetrics: (containerId: string, params?: { startTime?: string; endTime?: string }) =>
    request.get<any, ContainerMetric[]>(`/containers/${containerId}/metrics`, { params }),
  getLatestMetric: (containerId: string) => request.get<any, ContainerMetric>(`/containers/${containerId}/metrics/latest`),
  create: (data: Partial<Container>) => request.post('/containers', data),
  update: (id: number, data: Partial<Container>) => request.put(`/containers/${id}`, data),
  delete: (id: number) => request.delete(`/containers/${id}`),
};

export const appApi = {
  getList: (params?: PaginationParams & { type?: string }) => request.get<any, { list: App[]; total: number }>('/apps', { params }),
  getAll: (params?: { env?: string }) => request.get<any, App[]>('/apps/all', { params }),
  getOverview: () => request.get<any, any>('/apps/overview'),
  getMetrics: (appCode: string, params?: { startTime?: string; endTime?: string }) =>
    request.get<any, AppMetric[]>(`/apps/${appCode}/metrics`, { params }),
  getLatestMetric: (appCode: string) => request.get<any, AppMetric>(`/apps/${appCode}/metrics/latest`),
  create: (data: Partial<App>) => request.post('/apps', data),
  update: (id: number, data: Partial<App>) => request.put(`/apps/${id}`, data),
  delete: (id: number) => request.delete(`/apps/${id}`),
};

export const logApi = {
  getList: (params?: {
    page?: number;
    pageSize?: number;
    appCode?: string;
    env?: string;
    level?: string;
    keyword?: string;
    startTime?: string;
    endTime?: string;
  }) => request.get<any, { list: Log[]; total: number }>('/logs', { params }),
  getStats: (params?: { appCode?: string; env?: string; startTime?: string; endTime?: string }) =>
    request.get<any, any[]>('/logs/stats/count', { params }),
  ingest: (data: any | any[]) => request.post('/logs/ingest', data),
  clean: (days?: number) => request.delete('/logs/clean', { params: { days } }),
};

export const alertApi = {
  getRules: (params?: { page?: number; pageSize?: number; keyword?: string; enabled?: string }) =>
    request.get<any, { list: AlertRule[]; total: number }>('/alerts/rules', { params }),
  getAllRules: () => request.get<any, AlertRule[]>('/alerts/rules/all'),
  getRule: (id: number) => request.get<any, AlertRule>(`/alerts/rules/${id}`),
  createRule: (data: Partial<AlertRule>) => request.post('/alerts/rules', data),
  updateRule: (id: number, data: Partial<AlertRule>) => request.put(`/alerts/rules/${id}`, data),
  deleteRule: (id: number) => request.delete(`/alerts/rules/${id}`),
  getRecords: (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    level?: string;
    keyword?: string;
    startTime?: string;
    endTime?: string;
  }) => request.get<any, { list: AlertRecord[]; total: number }>('/alerts/records', { params }),
  getRecord: (id: number) => request.get<any, AlertRecord>(`/alerts/records/${id}`),
  handleRecord: (id: number, data: { status: string; handleNote?: string }) =>
    request.put(`/alerts/records/${id}/handle`, data),
  getOverview: () => request.get<any, any>('/alerts/overview'),
};

export const envApi = {
  getList: (params?: PaginationParams) => request.get<any, { list: Environment[]; total: number }>('/environments', { params }),
  getAll: () => request.get<any, Environment[]>('/environments/all'),
  create: (data: Partial<Environment>) => request.post('/environments', data),
  update: (id: number, data: Partial<Environment>) => request.put(`/environments/${id}`, data),
  delete: (id: number) => request.delete(`/environments/${id}`),
};

export interface Trace {
  id: number;
  traceId: string;
  appCode: string;
  env: string;
  userId: string;
  serviceName: string;
  serviceType: string;
  serviceIp: string;
  servicePort: number;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  hasError: boolean;
  errorMessage: string;
  requestParams: any;
  responseData: any;
  attributes: any;
  spanCount: number;
  errorSpanCount: number;
  timestamp: string;
}

export interface Span {
  id: number;
  traceId: string;
  spanId: string;
  parentSpanId: string;
  serviceName: string;
  serviceType: string;
  serviceIp: string;
  servicePort: number;
  name: string;
  kind: string;
  startTime: number;
  endTime: number;
  duration: number;
  hasError: boolean;
  errorMessage: string;
  stackTrace: string;
  protocol: string;
  component: string;
  requestParams: any;
  responseData: any;
  attributes: any;
  dbType: string;
  dbStatement: string;
  mqTopic: string;
  callType: string;
  region: string;
  timestamp: string;
}

export interface ServiceNode {
  id: string;
  name: string;
  type: string;
  ip: string;
  port: number;
  callCount: number;
  errorCount: number;
  avgDuration: number;
  errorRate: number;
  hasError: boolean;
  isEntry: boolean;
  isExit: boolean;
}

export interface ServiceEdge {
  source: string;
  target: string;
  callType: string;
  callCount: number;
  errorCount: number;
  errorRate: number;
  avgDuration: number;
  p95Duration: number;
  p99Duration: number;
}

export interface ApiMetric {
  id: number;
  appCode: string;
  env: string;
  method: string;
  path: string;
  requestCount: number;
  successCount: number;
  errorCount: number;
  errorRate: number;
  qps: number;
  avgDuration: number;
  p50Duration: number;
  p75Duration: number;
  p95Duration: number;
  p99Duration: number;
  minDuration: number;
  maxDuration: number;
  timestamp: string;
}

export interface AlertChannel {
  id: number;
  name: string;
  type: string;
  config: any;
  enabled: boolean;
  level: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertConvergence {
  id: number;
  ruleId: number;
  ruleName: string;
  groupKey: string;
  groupField: string;
  alertCount: number;
  triggerCount: number;
  isConverged: boolean;
  convergedAlertIds: string;
  summary: string;
  firstAlertTime: string;
  lastAlertTime: string;
  nextNotifyTime: string;
  updatedAt: string;
}

export const traceApi = {
  getList: (params?: {
    page?: number;
    pageSize?: number;
    traceId?: string;
    userId?: string;
    appCode?: string;
    serviceName?: string;
    path?: string;
    env?: string;
    hasError?: string;
    startTime?: string;
    endTime?: string;
    minDuration?: number;
    maxDuration?: number;
  }) => request.get<any, { list: Trace[]; total: number }>('/traces', { params }),

  getDetail: (traceId: string) => request.get<any, { trace: Trace; spans: Span[] }>(`/traces/${traceId}`),

  getSpans: (traceId: string) => request.get<any, Span[]>(`/traces/${traceId}/spans`),

  getSpanDetail: (spanId: string) => request.get<any, Span>(`/traces/spans/${spanId}`),

  getOverview: (params?: { env?: string; startTime?: string; endTime?: string }) =>
    request.get<any, any>('/traces/stats/overview', { params }),

  getTopSlow: (params?: { env?: string; limit?: number; startTime?: string; endTime?: string }) =>
    request.get<any, Trace[]>('/traces/stats/top-slow', { params }),

  getTopErrors: (params?: { env?: string; limit?: number; startTime?: string; endTime?: string }) =>
    request.get<any, Trace[]>('/traces/stats/top-errors', { params }),

  getTopTimeout: (params?: { env?: string; limit?: number; threshold?: number; startTime?: string; endTime?: string }) =>
    request.get<any, Trace[]>('/traces/stats/top-timeout', { params }),

  getTopology: (params?: { env?: string; startTime?: string; endTime?: string }) =>
    request.get<any, { nodes: ServiceNode[]; edges: ServiceEdge[] }>('/traces/dependency/topology', { params }),

  getDependencyList: (params?: {
    page?: number;
    pageSize?: number;
    env?: string;
    callerService?: string;
    calleeService?: string;
    startTime?: string;
    endTime?: string;
  }) => request.get<any, { list: any[]; total: number }>('/traces/dependency/list', { params }),

  getApiMetrics: (params?: {
    page?: number;
    pageSize?: number;
    appCode?: string;
    env?: string;
    path?: string;
    startTime?: string;
    endTime?: string;
  }) => request.get<any, { list: ApiMetric[]; total: number }>('/traces/api-metrics', { params }),

  getApiMetricChart: (params?: { appCode?: string; env?: string; path?: string; startTime?: string; endTime?: string }) =>
    request.get<any, ApiMetric[]>('/traces/api-metrics/chart', { params }),

  getTopSlowApi: (params?: { env?: string; limit?: number; startTime?: string; endTime?: string }) =>
    request.get<any, ApiMetric[]>('/traces/api-metrics/top-slow', { params }),

  getTopErrorApi: (params?: { env?: string; limit?: number; startTime?: string; endTime?: string }) =>
    request.get<any, ApiMetric[]>('/traces/api-metrics/top-error', { params }),

  getTopQpsApi: (params?: { env?: string; limit?: number; startTime?: string; endTime?: string }) =>
    request.get<any, ApiMetric[]>('/traces/api-metrics/top-qps', { params }),
};

export const alertChannelApi = {
  getList: (params?: { page?: number; pageSize?: number; type?: string; enabled?: string }) =>
    request.get<any, { list: AlertChannel[]; total: number }>('/alerts/channels', { params }),

  getAll: () => request.get<any, AlertChannel[]>('/alerts/channels/all'),

  get: (id: number) => request.get<any, AlertChannel>(`/alerts/channels/${id}`),

  create: (data: Partial<AlertChannel>) => request.post('/alerts/channels', data),

  update: (id: number, data: Partial<AlertChannel>) => request.put(`/alerts/channels/${id}`, data),

  delete: (id: number) => request.delete(`/alerts/channels/${id}`),

  test: (id: number) => request.post(`/alerts/channels/${id}/test`),
};

export const alertConvergenceApi = {
  getList: (params?: { page?: number; pageSize?: number; ruleId?: string; groupField?: string; isConverged?: string }) =>
    request.get<any, { list: AlertConvergence[]; total: number }>('/alerts/convergence', { params }),

  get: (id: number) => request.get<any, AlertConvergence & { alertRecords: AlertRecord[] }>(`/alerts/convergence/${id}`),

  acknowledge: (id: number) => request.post(`/alerts/convergence/${id}/acknowledge`),

  getStats: (params?: { startTime?: string; endTime?: string }) =>
    request.get<any, any>('/alerts/convergence/stats', { params }),
};

export const userApi = {
  getList: (params?: PaginationParams) => request.get<any, { list: User[]; total: number }>('/users', { params }),
  create: (data: Partial<User>) => request.post('/users', data),
  update: (id: number, data: Partial<User> & { password?: string }) => request.put(`/users/${id}`, data),
  delete: (id: number) => request.delete(`/users/${id}`),
};
