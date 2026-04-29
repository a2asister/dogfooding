import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
});

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return Promise.reject(new Error(response.data?.message || '请求失败'));
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
};

export const testCasesApi = {
  getAll: (params) => api.get('/test-cases', { params }),
  getById: (id) => api.get(`/test-cases/${id}`),
  create: (data) => api.post('/test-cases', data),
  update: (id, data) => api.put(`/test-cases/${id}`, data),
  delete: (id) => api.delete(`/test-cases/${id}`),
  clone: (id) => api.post(`/test-cases/${id}/clone`)
};

export const testSuitesApi = {
  getAll: (params) => api.get('/test-suites', { params }),
  getById: (id) => api.get(`/test-suites/${id}`),
  create: (data) => api.post('/test-suites', data),
  update: (id, data) => api.put(`/test-suites/${id}`, data),
  delete: (id) => api.delete(`/test-suites/${id}`)
};

export const tasksApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  run: (id) => api.post(`/tasks/${id}/run`)
};

export const testRunsApi = {
  getAll: (params) => api.get('/test-runs', { params }),
  getById: (id) => api.get(`/test-runs/${id}`),
  getReport: (id) => api.get(`/test-runs/${id}/report`),
  getLogs: (id) => api.get(`/test-runs/${id}/logs`),
  delete: (id) => api.delete(`/test-runs/${id}`)
};

export const environmentsApi = {
  getAll: (params) => api.get('/environments', { params }),
  getById: (id) => api.get(`/environments/${id}`),
  create: (data) => api.post('/environments', data),
  update: (id, data) => api.put(`/environments/${id}`, data),
  delete: (id) => api.delete(`/environments/${id}`)
};

export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  login: (credentials) => api.post('/users/login', credentials)
};

export const parametersApi = {
  getAll: (params) => api.get('/parameters', { params }),
  getById: (id) => api.get(`/parameters/${id}`),
  create: (data) => api.post('/parameters', data),
  update: (id, data) => api.put(`/parameters/${id}`, data),
  delete: (id) => api.delete(`/parameters/${id}`)
};

export const defectsApi = {
  getAll: (params) => api.get('/defects', { params }),
  getById: (id) => api.get(`/defects/${id}`),
  create: (data) => api.post('/defects', data),
  update: (id, data) => api.put(`/defects/${id}`, data),
  delete: (id) => api.delete(`/defects/${id}`)
};

export default api;
