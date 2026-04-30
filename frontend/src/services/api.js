import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, password, email) => api.post('/auth/register', { username, password, email }),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (oldPassword, newPassword) => api.put('/auth/change-password', { oldPassword, newPassword })
}

const deviceApi = {
  getAll: (params) => api.get('/devices', { params }),
  getById: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
  control: (id, state) => api.post(`/devices/${id}/control`, { state }),
  getStats: () => api.get('/devices/stats')
}

const sceneApi = {
  getAll: (params) => api.get('/scenes', { params }),
  getById: (id) => api.get(`/scenes/${id}`),
  create: (data) => api.post('/scenes', data),
  update: (id, data) => api.put(`/scenes/${id}`, data),
  delete: (id) => api.delete(`/scenes/${id}`),
  execute: (id) => api.post(`/scenes/${id}/execute`)
}

const taskApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  toggle: (id, isEnabled) => api.put(`/tasks/${id}/toggle`, { is_enabled: isEnabled })
}

const alertApi = {
  getAll: (params) => api.get('/alerts', { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  markAllAsRead: () => api.put('/alerts/read-all'),
  resolve: (id) => api.put(`/alerts/${id}/resolve`),
  getStats: () => api.get('/alerts/stats')
}

const energyApi = {
  getStats: (params) => api.get('/energy', { params }),
  getSummary: (params) => api.get('/energy/summary', { params })
}

export { 
  api, 
  authApi, 
  deviceApi, 
  sceneApi, 
  taskApi, 
  alertApi, 
  energyApi 
}