import axios from 'axios'

const API_BASE = 'http://localhost:4007/api/report'
const api = axios.create({ baseURL: API_BASE })

export const getDashboard = () => api.get('/dashboard')
export const getDailyReport = (date) => api.get('/daily', { params: { date } })
export const getMonthlyReport = (year, month) => api.get('/monthly', { params: { year, month } })
export const getCustomReport = (p) => api.get('/custom', { params: p })

export default { getDashboard, getDailyReport, getMonthlyReport, getCustomReport }
