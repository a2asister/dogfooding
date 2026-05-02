import axios from 'axios'

const API_BASE_URL = 'http://localhost:38901/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const dashboardApi = {
  getStats: () => api.get('/efficiency/dashboard')
}

export const employeesApi = {
  getAll: () => api.get('/employees'),
  getById: (id: string) => api.get(`/employees/${id}`)
}

export const attendanceApi = {
  getAll: (params?: { employeeId?: string; startDate?: string; endDate?: string }) => 
    api.get('/attendance', { params }),
  getOvertimeStats: (params?: { startDate?: string; endDate?: string }) => 
    api.get('/attendance/stats/overtime', { params }),
  getDailyStats: (params?: { startDate?: string; endDate?: string }) => 
    api.get('/attendance/stats/daily', { params })
}

export const tasksApi = {
  getAll: (params?: { employeeId?: string; projectId?: string; status?: string }) => 
    api.get('/tasks', { params }),
  getEfficiencyStats: () => api.get('/tasks/stats/efficiency'),
  getProjectStats: () => api.get('/tasks/stats/projects')
}

export const projectsApi = {
  getAll: (params?: { status?: string }) => api.get('/projects', { params }),
  getHours: (params?: { employeeId?: string; projectId?: string; startDate?: string; endDate?: string }) => 
    api.get('/projects/hours', { params }),
  getAllocationStats: () => api.get('/projects/stats/allocation')
}

export const collaborationApi = {
  getAll: (params?: { fromEmployeeId?: string; toEmployeeId?: string; startDate?: string; endDate?: string }) => 
    api.get('/collaboration', { params }),
  getNetwork: () => api.get('/collaboration/stats/network'),
  getTypeStats: () => api.get('/collaboration/stats/types')
}

export const efficiencyApi = {
  getMetrics: (params?: { period?: string }) => api.get('/efficiency/metrics', { params }),
  getOvertimeAlerts: (params?: { employeeId?: string; severity?: string }) => 
    api.get('/efficiency/alerts/overtime', { params }),
  getAllocationIssues: (params?: { employeeId?: string; issueType?: string }) => 
    api.get('/efficiency/alerts/allocation', { params })
}

export default api
