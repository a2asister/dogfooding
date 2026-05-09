import axios from 'axios'

const API_BASE = 'http://localhost:8765'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error.message)
    return Promise.reject(error)
  }
)

export const clipboardApi = {
  getItems: (type) => {
    const url = type ? `/api/items/${type}` : '/api/items'
    return api.get(url)
  },

  addItem: (content) => {
    return api.post('/api/items', { content })
  },

  updateItem: (id, updates) => {
    return api.put(`/api/items/${id}`, updates)
  },

  deleteItem: (id) => {
    return api.delete(`/api/items/${id}`)
  },

  clearAll: () => {
    return api.delete('/api/items')
  },

  search: (keyword, type) => {
    const params = new URLSearchParams()
    if (keyword) params.append('keyword', keyword)
    if (type) params.append('type', type)
    return api.get(`/api/search?${params.toString()}`)
  }
}

export default api
