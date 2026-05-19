import request from '../utils/request'
import type { News, NewsDetail, Event, PaginatedResponse, Ticket, Reservation, ComplianceDoc, Setting, FAQ } from '../types'

export const newsApi = {
  getList(params: { page?: number; pageSize?: number; category?: string; keyword?: string }) {
    return request.get<unknown, PaginatedResponse<News>>('/news', { params })
  },
  getLatest(limit: number = 3) {
    return request.get<unknown, News[]>('/news/latest', { params: { limit } })
  },
  getHotRecommend(limit: number = 5) {
    return request.get<unknown, News[]>('/news/hot', { params: { limit } })
  },
  getDetail(id: number) {
    return request.get<unknown, NewsDetail>(`/news/${id}`)
  },
  incrementShare(id: number) {
    return request.post(`/news/${id}/share`)
  },
  create(data: Partial<News>) {
    return request.post('/news', data)
  },
  update(id: number, data: Partial<News>) {
    return request.put(`/news/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/news/${id}`)
  }
}

export const eventApi = {
  getList(params: { page?: number; pageSize?: number; status?: string }) {
    return request.get<unknown, PaginatedResponse<Event>>('/events', { params })
  },
  getOngoing(limit: number = 3) {
    return request.get<unknown, Event[]>('/events/ongoing', { params: { limit } })
  },
  getAdminList(params: { page?: number; pageSize?: number }) {
    return request.get<unknown, PaginatedResponse<Event>>('/events/admin', { params })
  },
  getDetail(id: number) {
    return request.get<unknown, Event>(`/events/${id}`)
  },
  create(data: Partial<Event>) {
    return request.post('/events', data)
  },
  update(id: number, data: Partial<Event>) {
    return request.put(`/events/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/events/${id}`)
  }
}

export const homeApi = {
  getConfig() {
    return request.get<unknown, Record<string, unknown>>('/home/config')
  },
  getHomeData() {
    return request.get<unknown, Record<string, unknown>>('/home/data')
  },
  getAllConfig() {
    return request.get<unknown, unknown[]>('/admin/home/config')
  },
  updateConfig(data: { module_name: string; config_data: string; is_enabled?: number }) {
    return request.post('/admin/home/config', data)
  }
}

export const reservationApi = {
  create(data: { phone: string; platform?: string }) {
    return request.post('/reservation', data)
  },
  getList(params: { page?: number; pageSize?: number }) {
    return request.get<unknown, PaginatedResponse<Reservation>>('/admin/reservations', { params })
  },
  getStats() {
    return request.get<unknown, { total: number }>('/admin/reservations/stats')
  }
}

export const ticketApi = {
  create(data: { user_name?: string; contact: string; title: string; content: string }) {
    return request.post('/ticket', data)
  },
  getList(params: { page?: number; pageSize?: number; status?: string }) {
    return request.get<unknown, PaginatedResponse<Ticket>>('/admin/tickets', { params })
  },
  getDetail(id: number) {
    return request.get<unknown, Ticket>(`/admin/tickets/${id}`)
  },
  reply(id: number, reply: string) {
    return request.post(`/admin/tickets/${id}/reply`, { reply })
  },
  updateStatus(id: number, status: string) {
    return request.put(`/admin/tickets/${id}/status`, { status })
  }
}

export const complianceApi = {
  getAll() {
    return request.get<unknown, ComplianceDoc[]>('/compliance')
  },
  getByType(type: string) {
    return request.get<unknown, ComplianceDoc>(`/compliance/${type}`)
  },
  update(type: string, data: { title?: string; content?: string }) {
    return request.put(`/admin/compliance/${type}`, data)
  }
}

export const settingApi = {
  getAll() {
    return request.get<unknown, Record<string, string>>('/settings')
  },
  getFullList() {
    return request.get<unknown, Setting[]>('/admin/settings')
  },
  update(key: string, value: string) {
    return request.put('/admin/settings', { key, value })
  },
  batchUpdate(settings: Record<string, string>) {
    return request.post('/admin/settings/batch', settings)
  }
}

export const adminApi = {
  login(data: { username: string; password: string }) {
    return request.post<unknown, { id: number; username: string; role: string }>('/admin/login', data)
  },
  getAll() {
    return request.get<unknown, { id: number; username: string; role: string }[]>('/admin/users')
  },
  create(data: { username: string; password: string; role?: string }) {
    return request.post('/admin/users', data)
  }
}

export const uploadApi = {
  uploadImage(file: File) {
    const formData = new FormData()
    formData.append('image', file)
    return request.post<unknown, { url: string; filename: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  batchUpload(files: File[]) {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return request.post<unknown, { url: string; filename: string }[]>('/admin/media/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const faqApi = {
  getList(params: { category?: string; keyword?: string }) {
    return request.get<unknown, FAQ[]>('/faqs', { params })
  },
  getCategories() {
    return request.get<unknown, { category: string; count: number }[]>('/faqs/categories')
  },
  getDetail(id: number) {
    return request.get<unknown, FAQ>(`/faqs/${id}`)
  }
}

export const statisticsApi = {
  getSummary(period: 'day' | 'week' | 'month' = 'day') {
    return request.get<unknown, {
      pv: number
      uv: number
      downloads: number
      reservations: number
      news_views: number
      event_clicks: number
      tickets: number
      trend: { date: string; value: number; field: string }[]
    }>('/admin/statistics/summary', { params: { period } })
  },
  getByDateRange(startDate: string, endDate: string) {
    return request.get<unknown, any[]>('/admin/statistics/date-range', { params: { startDate, endDate } })
  },
  exportCSV(params: { startDate?: string; endDate?: string; period?: 'day' | 'week' | 'month' }) {
    return request.get('/admin/statistics/export', { params, responseType: 'blob' })
  }
}
