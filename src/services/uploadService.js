import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          ElMessage.error(data.message || '请求参数错误')
          break
        case 500:
          ElMessage.error(data.message || '服务器内部错误')
          break
        default:
          ElMessage.error(data.message || '请求失败')
      }
    } else if (error.request) {
      if (error.code === 'ECONNABORTED') {
        ElMessage.error('请求超时')
      } else {
        ElMessage.error('网络错误，请检查网络连接')
      }
    }
    return Promise.reject(error)
  }
)

// 检查文件上传状态（断点续传）
export const checkUploadStatus = async (params) => {
  return api.get('/upload/check', { params })
}

// 上传分片
export const uploadChunk = async (formData, config = {}) => {
  return api.post('/upload/chunk', formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 合并分片
export const mergeChunks = async (data) => {
  return api.post('/upload/merge', data)
}

// 获取已上传文件列表
export const getUploadedFiles = async () => {
  return api.get('/upload/files')
}

// 删除已上传文件
export const deleteUploadedFile = async (fileName) => {
  return api.delete(`/upload/files/${encodeURIComponent(fileName)}`)
}

export default {
  checkUploadStatus,
  uploadChunk,
  mergeChunks,
  getUploadedFiles,
  deleteUploadedFile
}
