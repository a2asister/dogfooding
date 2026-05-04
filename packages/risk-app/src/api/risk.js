import axios from 'axios'

const API_BASE = 'http://localhost:4006/api/risk'
const api = axios.create({ baseURL: API_BASE })

export const getAssessments = (p = {}) => api.get('/assessments', { params: p })
export const getAssessmentById = (id) => api.get(`/assessments/${id}`)
export const createAssessment = (d) => api.post('/assessments', d)
export const getAlerts = (p = {}) => api.get('/alerts', { params: p })
export const resolveAlert = (id, d) => api.put(`/alerts/${id}/resolve`, d)
export const getBlacklist = () => api.get('/blacklist')
export const addToBlacklist = (d) => api.post('/blacklist', d)

export default { getAssessments, getAssessmentById, createAssessment, getAlerts, resolveAlert, getBlacklist, addToBlacklist }
