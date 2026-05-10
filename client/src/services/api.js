const API_BASE = '/api'

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })
  return response.json()
}

export const api = {
  getContents: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/contents${query ? '?' + query : ''}`)
  },
  
  getContent: (id) => request(`/contents/${id}`),
  
  createContent: (data) => request('/contents', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  updateContent: (id, data) => request(`/contents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  deleteContent: (id) => request(`/contents/${id}`, {
    method: 'DELETE'
  }),
  
  reviewContent: (id, action, reason) => request(`/contents/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ action, reason })
  }),
  
  engageContent: (id, type) => request(`/contents/${id}/engage`, {
    method: 'POST',
    body: JSON.stringify({ type })
  }),
  
  monetizeContent: (id, revenue, clicks) => request(`/contents/${id}/monetize`, {
    method: 'POST',
    body: JSON.stringify({ revenue, clicks })
  }),
  
  getTrafficRules: () => request('/traffic/rules'),
  
  addTrafficRule: (name, description) => request('/traffic/rules', {
    method: 'POST',
    body: JSON.stringify({ name, description })
  }),
  
  toggleTrafficRule: (id) => request(`/traffic/rules/${id}/toggle`, {
    method: 'POST'
  }),
  
  getAuditLogs: () => request('/traffic/logs'),
  
  getStatistics: () => request('/traffic/statistics')
}
