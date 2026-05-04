import axios from 'axios'

const API_BASE = 'http://localhost:4003/api/wealth'

const api = axios.create({ baseURL: API_BASE })

export const getProducts = (params = {}) => api.get('/products', { params })
export const getProductById = (id) => api.get(`/products/${id}`)
export const getInvestments = (params = {}) => api.get('/investments', { params })
export const createInvestment = (data) => api.post('/invest', data)

export default {
  getProducts,
  getProductById,
  getInvestments,
  createInvestment
}
