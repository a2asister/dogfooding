import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
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
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      const message = error.response.data?.error || '请求失败'
      return Promise.reject(new Error(message))
    }
    return Promise.reject(new Error('网络错误'))
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me')
}

export const codeReposApi = {
  getAll: () => api.get('/code-repos'),
  getById: (id) => api.get(`/code-repos/${id}`),
  create: (data) => api.post('/code-repos', data),
  update: (id, data) => api.put(`/code-repos/${id}`, data),
  delete: (id) => api.delete(`/code-repos/${id}`)
}

export const apiDocsApi = {
  getAll: () => api.get('/api-docs'),
  getById: (id) => api.get(`/api-docs/${id}`),
  create: (data) => api.post('/api-docs', data),
  update: (id, data) => api.put(`/api-docs/${id}`, data),
  delete: (id) => api.delete(`/api-docs/${id}`)
}

export const designResourcesApi = {
  getAll: () => api.get('/design-resources'),
  getById: (id) => api.get(`/design-resources/${id}`),
  create: (data) => api.post('/design-resources', data),
  update: (id, data) => api.put(`/design-resources/${id}`, data),
  delete: (id) => api.delete(`/design-resources/${id}`)
}

export const testCasesApi = {
  getAll: () => api.get('/test-cases'),
  getById: (id) => api.get(`/test-cases/${id}`),
  create: (data) => api.post('/test-cases', data),
  update: (id, data) => api.put(`/test-cases/${id}`, data),
  delete: (id) => api.delete(`/test-cases/${id}`)
}

export const deploymentsApi = {
  getAll: () => api.get('/deployments'),
  getById: (id) => api.get(`/deployments/${id}`),
  create: (data) => api.post('/deployments', data),
  update: (id, data) => api.put(`/deployments/${id}`, data),
  delete: (id) => api.delete(`/deployments/${id}`)
}

export const gitIntegrationsApi = {
  getAll: () => api.get('/git-integrations'),
  getById: (id) => api.get(`/git-integrations/${id}`),
  create: (data) => api.post('/git-integrations', data),
  update: (id, data) => api.put(`/git-integrations/${id}`, data),
  delete: (id) => api.delete(`/git-integrations/${id}`)
}

export const cicdPipelinesApi = {
  getAll: () => api.get('/cicd-pipelines'),
  getById: (id) => api.get(`/cicd-pipelines/${id}`),
  create: (data) => api.post('/cicd-pipelines', data),
  update: (id, data) => api.put(`/cicd-pipelines/${id}`, data),
  delete: (id) => api.delete(`/cicd-pipelines/${id}`)
}

export const cloudServicesApi = {
  getAll: () => api.get('/cloud-services'),
  getById: (id) => api.get(`/cloud-services/${id}`),
  create: (data) => api.post('/cloud-services', data),
  update: (id, data) => api.put(`/cloud-services/${id}`, data),
  delete: (id) => api.delete(`/cloud-services/${id}`)
}

export const assetLedgerApi = {
  getAll: () => api.get('/asset-ledger'),
  getById: (id) => api.get(`/asset-ledger/${id}`),
  create: (data) => api.post('/asset-ledger', data),
  update: (id, data) => api.put(`/asset-ledger/${id}`, data),
  delete: (id) => api.delete(`/asset-ledger/${id}`)
}

export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
}

export const permissionsApi = {
  getAll: () => api.get('/permissions'),
  getById: (id) => api.get(`/permissions/${id}`),
  create: (data) => api.post('/permissions', data),
  update: (id, data) => api.put(`/permissions/${id}`, data),
  delete: (id) => api.delete(`/permissions/${id}`)
}

export default api
