import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
}

export const notesApi = {
  getAll: () => api.get('/notes'),
  getById: (id: number) => api.get(`/notes/${id}`),
  create: (data: {
    title: string
    content?: string
    categoryId?: number
    tagIds?: number[]
    isEncrypted?: boolean
  }) => api.post('/notes', data),
  update: (
    id: number,
    data: {
      title?: string
      content?: string
      categoryId?: number | null
      tagIds?: number[]
      isEncrypted?: boolean
    }
  ) => api.put(`/notes/${id}`, data),
  delete: (id: number) => api.delete(`/notes/${id}`),
  search: (query: string) => api.get(`/notes/search?q=${encodeURIComponent(query)}`),
  getByCategory: (categoryId: number) => api.get(`/notes/category/${categoryId}`),
  getByTag: (tagId: number) => api.get(`/notes/tag/${tagId}`),
  getByDateRange: (startDate: string, endDate: string) =>
    api.get(`/notes/date-range?startDate=${startDate}&endDate=${endDate}`),
  getArchive: () => api.get('/notes/archive'),
}

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: { name: string; color?: string; icon?: string }) =>
    api.post('/categories', data),
  update: (id: number, data: { name?: string; color?: string; icon?: string }) =>
    api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
}

export const tagsApi = {
  getAll: () => api.get('/tags'),
  getById: (id: number) => api.get(`/tags/${id}`),
  create: (data: { name: string }) => api.post('/tags', data),
  delete: (id: number) => api.delete(`/tags/${id}`),
}

export const noteVersionsApi = {
  getByNoteId: (noteId: number) => api.get(`/notes/${noteId}/versions`),
  getVersion: (noteId: number, version: number) =>
    api.get(`/notes/${noteId}/versions/${version}`),
  restoreVersion: (noteId: number, version: number) =>
    api.get(`/notes/${noteId}/versions/${version}/restore`),
}

export const syncApi = {
  getStatus: () => api.get('/sync/status'),
  getPendingChanges: (since?: string) =>
    api.get(`/sync/pending${since ? `?since=${since}` : ''}`),
  markAsSynced: (recordIds: number[]) =>
    api.post('/sync/mark-synced', { recordIds }),
  syncAll: () => api.post('/sync/all'),
  getHistory: (limit?: number) =>
    api.get(`/sync/history${limit ? `?limit=${limit}` : ''}`),
}
