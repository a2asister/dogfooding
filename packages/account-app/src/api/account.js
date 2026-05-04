import axios from 'axios'

const API_BASE_URL = 'http://localhost:4001'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const accountApi = {
  getAccounts: (params = {}) => {
    return api.get('/api/accounts', { params })
  },

  getAccountById: (id) => {
    return api.get(`/api/accounts/${id}`)
  },

  getAccountsByCustomer: (customerId) => {
    return api.get(`/api/accounts/customer/${customerId}`)
  },

  createAccount: (data) => {
    return api.post('/api/accounts', data)
  },

  updateAccountStatus: (id, status) => {
    return api.put(`/api/accounts/${id}/status`, { status })
  },

  freezeAccount: (id, amount) => {
    return api.put(`/api/accounts/${id}/freeze`, { amount })
  },

  getStats: () => {
    return api.get('/api/accounts/stats/summary')
  }
}

export default accountApi
