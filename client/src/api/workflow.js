import request from '@/utils/request'

export const approveSubmission = (submissionId, data) => {
  return request.post(`/workflow/${submissionId}/approve`, data)
}

export const rejectSubmission = (submissionId, data) => {
  return request.post(`/workflow/${submissionId}/reject`, data)
}

export const returnSubmission = (submissionId, data) => {
  return request.post(`/workflow/${submissionId}/return`, data)
}

export const getPendingApprovals = (userId) => {
  return request.get(`/workflow/submissions/${userId}/pending`)
}
