import axios from 'axios'

const API_BASE = 'http://localhost:4004/api'

const api = axios.create({ baseURL: API_BASE })

export const getLoans = (params = {}) => api.get('/loans', { params })
export const getLoanById = (id) => api.get(`/loans/${id}`)
export const getLoanPayments = (id) => api.get(`/loans/${id}/payments`)
export const createLoan = (data) => api.post('/loans', data)
export const approveLoan = (id) => api.put(`/loans/${id}/approve`)

export default {
  getLoans,
  getLoanById,
  getLoanPayments,
  createLoan,
  approveLoan
}
