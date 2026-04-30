import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.response.use(
  (response) => {
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message || '请求失败')
  },
  (error) => {
    console.error('API 请求错误:', error)
    throw error
  }
)

export const apiService = {
  getOverview: () => api.get('/overview'),
  getAnimals: () => api.get('/animals'),
  getAnimal: (id) => api.get(`/animals/${id}`),
  getVenues: () => api.get('/venues'),
  getCrowds: () => api.get('/crowds'),
  getEnvironments: () => api.get('/environments'),
  getEnvironment: (venueId) => api.get(`/environments/${venueId}`),
  getSecurity: () => api.get('/security'),
  getDevices: () => api.get('/devices'),
  getAlerts: () => api.get('/alerts'),
  updateAlert: (id, data) => api.put(`/alerts/${id}`, data),
  getUsers: () => api.get('/users'),
  login: (username, password) => api.post('/login', { username, password }),
  getOperationLogs: () => api.get('/operation-logs'),
  getFeedingRecords: () => api.get('/feeding-records'),
  getLogs: (date) => api.get(date ? `/logs/${date}` : '/logs')
}

export default api
