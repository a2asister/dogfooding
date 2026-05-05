import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const insuranceProductApi = {
  getAll: () => api.get('/insurance-products'),
  getById: (id: string) => api.get(`/insurance-products/${id}`),
  create: (data: any) => api.post('/insurance-products', data),
  update: (id: string, data: any) => api.put(`/insurance-products/${id}`, data),
  delete: (id: string) => api.delete(`/insurance-products/${id}`)
}

export const insuredPersonApi = {
  getAll: () => api.get('/insured-persons'),
  getById: (id: string) => api.get(`/insured-persons/${id}`),
  create: (data: any) => api.post('/insured-persons', data),
  update: (id: string, data: any) => api.put(`/insured-persons/${id}`, data),
  delete: (id: string) => api.delete(`/insured-persons/${id}`)
}

export const insuranceApplicationApi = {
  getAll: () => api.get('/insurance-applications'),
  getById: (id: string) => api.get(`/insurance-applications/${id}`),
  create: (data: any) => api.post('/insurance-applications', data),
  update: (id: string, data: any) => api.put(`/insurance-applications/${id}`, data),
  delete: (id: string) => api.delete(`/insurance-applications/${id}`)
}

export const underwritingRecordApi = {
  getAll: () => api.get('/underwriting-records'),
  getById: (id: string) => api.get(`/underwriting-records/${id}`),
  getByApplicationId: (applicationId: string) => api.get(`/underwriting-records?applicationId=${applicationId}`),
  create: (data: any) => api.post('/underwriting-records', data),
  update: (id: string, data: any) => api.put(`/underwriting-records/${id}`, data),
  delete: (id: string) => api.delete(`/underwriting-records/${id}`)
}

export const insurancePolicyApi = {
  getAll: () => api.get('/insurance-policies'),
  getById: (id: string) => api.get(`/insurance-policies/${id}`),
  getByPolicyNumber: (policyNumber: string) => api.get(`/insurance-policies?policyNumber=${policyNumber}`),
  create: (data: any) => api.post('/insurance-policies', data),
  update: (id: string, data: any) => api.put(`/insurance-policies/${id}`, data),
  delete: (id: string) => api.delete(`/insurance-policies/${id}`)
}

export const claimApplicationApi = {
  getAll: () => api.get('/claim-applications'),
  getById: (id: string) => api.get(`/claim-applications/${id}`),
  getByPolicyId: (policyId: string) => api.get(`/claim-applications?policyId=${policyId}`),
  create: (data: any) => api.post('/claim-applications', data),
  update: (id: string, data: any) => api.put(`/claim-applications/${id}`, data),
  delete: (id: string) => api.delete(`/claim-applications/${id}`)
}

export const antiFraudApi = {
  getAll: () => api.get('/anti-fraud-records'),
  getById: (id: string) => api.get(`/anti-fraud-records/${id}`),
  getByRelatedId: (relatedId: string) => api.get(`/anti-fraud-records?relatedId=${relatedId}`),
  create: (data: any) => api.post('/anti-fraud-records', data),
  update: (id: string, data: any) => api.put(`/anti-fraud-records/${id}`, data),
  delete: (id: string) => api.delete(`/anti-fraud-records/${id}`)
}

export const actuarialApi = {
  getAll: () => api.get('/actuarial-data'),
  getById: (id: string) => api.get(`/actuarial-data/${id}`),
  getByProductId: (productId: string) => api.get(`/actuarial-data?productId=${productId}`),
  create: (data: any) => api.post('/actuarial-data', data),
  update: (id: string, data: any) => api.put(`/actuarial-data/${id}`, data),
  delete: (id: string) => api.delete(`/actuarial-data/${id}`)
}

export default api
