import axios from 'axios'

const API_BASE_URL = 'http://localhost:4002'

const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000, headers: { 'Content-Type': 'application/json' } })
api.interceptors.response.use(response => response.data, error => Promise.reject(error))

export const transactionApi = {
  getTransactions: params => api.get('/api/transactions', { params }),
  getTransactionById: id => api.get(`/api/transactions/${id}`),
  createTransaction: data => api.post('/api/transactions', data),
  getStats: () => api.get('/api/transactions/stats/summary')
}

export default transactionApi
