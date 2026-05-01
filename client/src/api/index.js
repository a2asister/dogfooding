const API_BASE = 'http://localhost:3002/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  console.log('API请求:', url, options)
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    console.log('API响应状态:', response.status)
    
    const data = await response.json()
    console.log('API响应数据:', data)
    
    if (!data.success) {
      throw new Error(data.error || '请求失败')
    }
    return data.data
  } catch (error) {
    console.error('API请求失败:', error)
    throw error
  }
}

export const api = {
  async getMessages(params = {}) {
    const query = new URLSearchParams(params).toString()
    return request(`/messages${query ? `?${query}` : ''}`)
  },
  
  async getMessage(id) {
    return request(`/messages/${id}`)
  },
  
  async markAsRead(id) {
    return request(`/messages/${id}/read`, {
      method: 'PUT'
    })
  },
  
  async updateTags(id, tags) {
    return request(`/messages/${id}/tags`, {
      method: 'PUT',
      body: JSON.stringify({ tags })
    })
  },
  
  async updatePriority(id, priority) {
    return request(`/messages/${id}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority })
    })
  },
  
  async getStatistics() {
    return request('/statistics')
  },
  
  async getRules() {
    return request('/rules')
  },
  
  async createRule(rule) {
    return request('/rules', {
      method: 'POST',
      body: JSON.stringify(rule)
    })
  },
  
  async updateRule(id, rule) {
    return request(`/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rule)
    })
  },
  
  async deleteRule(id) {
    return request(`/rules/${id}`, {
      method: 'DELETE'
    })
  },
  
  async simulateMessage() {
    return request('/messages/simulate', {
      method: 'POST'
    })
  }
}

export default api
