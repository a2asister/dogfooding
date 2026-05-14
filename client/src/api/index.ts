import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const uploadImage = (file: File, params?: any) => {
  const formData = new FormData()
  formData.append('file', file)
  if (params) {
    formData.append('params', JSON.stringify(params))
  }
  return api.post('/upload', formData)
}

export const getUploads = () => api.get('/upload')

export const saveWork = (data: { title: string; imageData: string; params: any }) => {
  return api.post('/work', data)
}

export const getWorks = (page?: number, limit?: number) => {
  return api.get('/work', { params: { page, limit } })
}

export const getStats = () => api.get('/stats')

export default api
