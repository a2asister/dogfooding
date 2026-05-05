import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const logsApi = {
  ingest: (logs, type = 'backend') => 
    api.post('/logs/ingest', { logs, type }),
  
  search: (params = {}) => 
    api.get('/logs/search', { params }),
  
  getById: (id) => 
    api.get(`/logs/${id}`),
  
  getStats: () => 
    api.get('/logs/stats'),
  
  getServices: () => 
    api.get('/logs/services'),
  
  createService: (data) => 
    api.post('/logs/services', data)
}

export const alertsApi = {
  getRules: () => 
    api.get('/alerts/rules'),
  
  createRule: (data) => 
    api.post('/alerts/rules', data),
  
  updateRule: (id, data) => 
    api.put(`/alerts/rules/${id}`, data),
  
  deleteRule: (id) => 
    api.delete(`/alerts/rules/${id}`),
  
  evaluateRules: () => 
    api.post('/alerts/rules/evaluate'),
  
  getAlerts: (params = {}) => 
    api.get('/alerts', { params }),
  
  getAlertById: (id) => 
    api.get(`/alerts/${id}`),
  
  acknowledge: (id, data) => 
    api.put(`/alerts/${id}/acknowledge`, data),
  
  resolve: (id, data) => 
    api.put(`/alerts/${id}/resolve`, data)
}

export const tracesApi = {
  create: (data) => 
    api.post('/traces/create', data),
  
  createSpan: (data) => 
    api.post('/traces/span', data),
  
  finishSpan: (spanId, data) => 
    api.post(`/traces/span/${spanId}/finish`, data),
  
  search: (params = {}) => 
    api.get('/traces/search', { params }),
  
  getById: (traceId) => 
    api.get(`/traces/${traceId}`),
  
  getWithLogs: (traceId) => 
    api.get(`/traces/${traceId}/with-logs`),
  
  getTree: (traceId) => 
    api.get(`/traces/${traceId}/tree`)
}

export const replayApi = {
  createSession: (data) => 
    api.post('/replay/session/create', data),
  
  getSession: (sessionId) => 
    api.get(`/replay/session/${sessionId}`),
  
  play: (sessionId) => 
    api.post(`/replay/session/${sessionId}/play`),
  
  pause: (sessionId) => 
    api.post(`/replay/session/${sessionId}/pause`),
  
  stop: (sessionId) => 
    api.post(`/replay/session/${sessionId}/stop`),
  
  seek: (sessionId, data) => 
    api.post(`/replay/session/${sessionId}/seek`, data),
  
  getEvents: (sessionId, count = 10) => 
    api.get(`/replay/session/${sessionId}/events`, { params: { count } }),
  
  getTimeline: (sessionId) => 
    api.get(`/replay/session/${sessionId}/timeline`),
  
  getCallChain: (sessionId) => 
    api.get(`/replay/session/${sessionId}/callchain`),
  
  getLogByIndex: (sessionId, index) => 
    api.get(`/replay/session/${sessionId}/logs/${index}`),
  
  closeSession: (sessionId) => 
    api.delete(`/replay/session/${sessionId}`),
  
  getAllSessions: () => 
    api.get('/replay/sessions')
}

export const timeSeriesApi = {
  getStats: () => 
    api.get('/replay/timeseries/stats'),
  
  getAggregation: (params = {}) => 
    api.get('/replay/timeseries/aggregation', { params }),
  
  getTrend: (params = {}) => 
    api.get('/replay/timeseries/trend', { params }),
  
  query: (data) => 
    api.post('/replay/timeseries/query', data),
  
  compact: () => 
    api.post('/replay/timeseries/compact'),
  
  clearCache: () => 
    api.post('/replay/timeseries/clear-cache')
}

export default api
