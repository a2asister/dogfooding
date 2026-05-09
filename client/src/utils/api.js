import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const exchangeApi = {
  getRates: () => api.get('/exchange-rates'),
  refreshRates: () => api.post('/exchange-rates/refresh')
}

export const favoritesApi = {
  getAll: () => api.get('/favorites'),
  add: (data) => api.post('/favorites', data),
  remove: (id) => api.delete(`/favorites/${id}`)
}

export const historyApi = {
  getAll: () => api.get('/history'),
  add: (data) => api.post('/history', data),
  clear: () => api.delete('/history')
}

export default api
