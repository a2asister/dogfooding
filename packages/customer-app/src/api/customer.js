import axios from 'axios'

const API_BASE = 'http://localhost:4008/api/customer'
const api = axios.create({ baseURL: API_BASE })

export const getDashboard = () => api.get('/dashboard')
export const getCustomers = (p = {}) => api.get('/list', { params: p })
export const getCustomerById = (id) => api.get(`/${id}`)
export const createCustomer = (d) => api.post('/', d)
export const updateCustomer = (id, d) => api.put(`/${id}`, d)
export const getStats = () => api.get('/stats')

export default { getDashboard, getCustomers, getCustomerById, createCustomer, updateCustomer, getStats }
