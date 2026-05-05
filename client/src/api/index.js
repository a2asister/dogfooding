import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const statsAPI = {
  getStats: () => api.get('/stats')
}

export const workflowsAPI = {
  getWorkflows: () => api.get('/workflows'),
  getWorkflow: (id) => api.get(`/workflows/${id}`),
  createWorkflow: (data) => api.post('/workflows', data),
  updateWorkflow: (id, data) => api.put(`/workflows/${id}`, data),
  deleteWorkflow: (id) => api.delete(`/workflows/${id}`),
  runWorkflow: (id, data) => api.post(`/workflows/${id}/run`, data)
}

export const robotsAPI = {
  getRobots: () => api.get('/robots'),
  getRobot: (id) => api.get(`/robots/${id}`),
  createRobot: (data) => api.post('/robots', data),
  updateRobot: (id, data) => api.put(`/robots/${id}`, data),
  deleteRobot: (id) => api.delete(`/robots/${id}`),
  heartbeat: (id, data) => api.post(`/robots/${id}/heartbeat`, data),
  assignWorkflow: (id, workflowId) => api.post(`/robots/${id}/assign-workflow`, { workflowId }),
  removeWorkflow: (id, workflowId) => api.post(`/robots/${id}/remove-workflow`, { workflowId })
}

export const schedulesAPI = {
  getSchedules: () => api.get('/schedules'),
  getSchedule: (id) => api.get(`/schedules/${id}`),
  createSchedule: (data) => api.post('/schedules', data),
  updateSchedule: (id, data) => api.put(`/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/schedules/${id}`),
  toggleSchedule: (id) => api.post(`/schedules/${id}/toggle`),
  runSchedule: (id) => api.post(`/schedules/${id}/run`)
}

export const scriptsAPI = {
  getScripts: () => api.get('/scripts'),
  getScript: (id) => api.get(`/scripts/${id}`),
  createScript: (data) => api.post('/scripts', data),
  updateScript: (id, data) => api.put(`/scripts/${id}`, data),
  deleteScript: (id) => api.delete(`/scripts/${id}`),
  executeScript: (id, data) => api.post(`/scripts/${id}/execute`, data)
}

export const apisAPI = {
  getAPIs: () => api.get('/apis'),
  getAPI: (id) => api.get(`/apis/${id}`),
  createAPI: (data) => api.post('/apis', data),
  updateAPI: (id, data) => api.put(`/apis/${id}`, data),
  deleteAPI: (id) => api.delete(`/apis/${id}`),
  testAPI: (id, data) => api.post(`/apis/${id}/test`, data)
}

export const executionsAPI = {
  getExecutions: (params) => api.get('/executions', { params }),
  getExecution: (id) => api.get(`/executions/${id}`),
  createExecution: (data) => api.post('/executions', data),
  updateExecution: (id, data) => api.put(`/executions/${id}`, data),
  addLog: (id, data) => api.post(`/executions/${id}/log`, data),
  addStep: (id, data) => api.post(`/executions/${id}/step`, data),
  completeExecution: (id, data) => api.post(`/executions/${id}/complete`, data),
  cancelExecution: (id) => api.post(`/executions/${id}/cancel`)
}

export const recordingsAPI = {
  getTypes: () => api.get('/recordings/types'),
  getRecordings: () => api.get('/recordings'),
  getRecording: (id) => api.get(`/recordings/${id}`),
  createRecording: (data) => api.post('/recordings', data),
  addStep: (id, data) => api.post(`/recordings/${id}/step`, data),
  updateRecording: (id, data) => api.put(`/recordings/${id}`, data),
  stopRecording: (id) => api.post(`/recordings/${id}/stop`),
  convertToWorkflow: (id) => api.post(`/recordings/${id}/convert-workflow`),
  deleteRecording: (id) => api.delete(`/recordings/${id}`)
}

export default api
