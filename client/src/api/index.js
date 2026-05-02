import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const res = response.data
    if (res.success) {
      return res
    } else {
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  error => {
    return Promise.reject(error)
  }
)

// 演出相关API
export const eventApi = {
  getEvents() {
    return api.get('/events')
  },
  getEventById(id) {
    return api.get(`/events/${id}`)
  }
}

// 场次相关API
export const sessionApi = {
  getSessionsByEventId(eventId) {
    return api.get(`/events/${eventId}/sessions`)
  },
  getSessionById(id) {
    return api.get(`/sessions/${id}`)
  }
}

// 座位相关API
export const seatApi = {
  getSeatsBySessionId(sessionId) {
    return api.get(`/sessions/${sessionId}/seats`)
  },
  lockSeats(data) {
    return api.post('/seats/lock', data)
  },
  unlockSeats(data) {
    return api.post('/seats/unlock', data)
  },
  confirmSeats(data) {
    return api.post('/seats/confirm', data)
  }
}

export default api
