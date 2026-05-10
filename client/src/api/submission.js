import request from '@/utils/request'

export const getSubmissionList = (params) => {
  return request.get('/submissions', { params })
}

export const getSubmission = (id) => {
  return request.get(`/submissions/${id}`)
}

export const createSubmission = (data) => {
  return request.post('/submissions', data)
}

export const updateSubmission = (id, data) => {
  return request.put(`/submissions/${id}`, data)
}

export const deleteSubmission = (id) => {
  return request.delete(`/submissions/${id}`)
}

export const submitSubmission = (id) => {
  return request.post(`/submissions/${id}/submit`)
}
