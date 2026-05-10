import request from '@/utils/request'

export const getTemplateList = (params) => {
  return request.get('/templates', { params })
}

export const getTemplateCategories = () => {
  return request.get('/templates/categories')
}

export const applyTemplate = (templateId, data) => {
  return request.post(`/templates/${templateId}/apply`, data)
}

export const seedTemplates = () => {
  return request.post('/templates/seed')
}
