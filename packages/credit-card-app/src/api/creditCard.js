import axios from 'axios'

const API_BASE = 'http://localhost:4005/api/credit-cards'
const api = axios.create({ baseURL: API_BASE })

export const getCards = (params = {}) => api.get('/', { params })
export const getCardById = (id) => api.get(`/${id}`)
export const getCardTransactions = (id) => api.get(`/${id}/transactions`)
export const createCard = (data) => api.post('/', data)
export const updateCardStatus = (id, status) => api.put(`/${id}/status`, { status })

export default { getCards, getCardById, getCardTransactions, createCard, updateCardStatus }
