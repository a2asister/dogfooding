import axios from 'axios'

const API_BASE_URL = '/api'

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
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
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 弹幕配置相关API
export const configApi = {
  // 获取配置
  getConfig: () => api.get('/config'),
  
  // 更新配置
  updateConfig: (config) => api.put('/config', config)
}

// 屏蔽词相关API
export const blockedWordsApi = {
  // 获取屏蔽词列表
  getBlockedWords: () => api.get('/blocked-words'),
  
  // 添加屏蔽词
  addBlockedWord: (word) => api.post('/blocked-words', { word }),
  
  // 删除屏蔽词
  deleteBlockedWord: (word) => api.delete(`/blocked-words/${encodeURIComponent(word)}`),
  
  // 批量更新屏蔽词
  updateBlockedWords: (words) => api.put('/blocked-words', { words })
}

// 云同步相关API
export const syncApi = {
  // 获取同步数据
  getSyncData: () => api.get('/sync'),
  
  // 同步数据
  syncData: (data) => api.post('/sync', data)
}

// 健康检查
export const healthCheck = () => api.get('/health')

export default api
