import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 产品API
export const productApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
}

// SKU API
export const skuApi = {
  getAll: () => api.get('/skus'),
  getById: (id) => api.get(`/skus/${id}`),
  getByProductId: (productId) => api.get(`/skus/product/${productId}`),
  create: (data) => api.post('/skus', data),
  update: (id, data) => api.put(`/skus/${id}`, data),
  updateStock: (id, data) => api.put(`/skus/${id}/stock`, data),
  delete: (id) => api.delete(`/skus/${id}`),
  checkSpecs: (data) => api.post('/skus/check-specs', data)
}

// 优惠API
export const discountApi = {
  getAll: () => api.get('/discounts'),
  getById: (id) => api.get(`/discounts/${id}`),
  create: (data) => api.post('/discounts', data),
  update: (id, data) => api.put(`/discounts/${id}`, data),
  delete: (id) => api.delete(`/discounts/${id}`),
  calculate: (data) => api.post('/discounts/calculate', data)
}

export default api