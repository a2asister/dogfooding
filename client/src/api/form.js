import request from '@/utils/request'

export const getFormList = (params) => {
  return request.get('/forms', { params })
}

export const getForm = (id) => {
  return request.get(`/forms/${id}`)
}

export const createForm = (data) => {
  return request.post('/forms', data)
}

export const updateForm = (id, data) => {
  return request.put(`/forms/${id}`, data)
}

export const deleteForm = (id) => {
  return request.delete(`/forms/${id}`)
}

export const publishForm = (id) => {
  return request.post(`/forms/${id}/publish`)
}

export const unpublishForm = (id) => {
  return request.post(`/forms/${id}/unpublish`)
}

export const duplicateForm = (id) => {
  return request.post(`/forms/${id}/duplicate`)
}
