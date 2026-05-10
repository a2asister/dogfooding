const API_BASE = '/api'

const request = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || response.statusText)
  }

  return response.json()
}

export const workflowApi = {
  list: () => request('/workflows'),
  get: (id) => request(`/workflows/${id}`),
  create: (data) => request('/workflows', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => request(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/workflows/${id}`, {
    method: 'DELETE'
  }),
  run: (workflowId, versionId, data = {}) => request('/executions/run', {
    method: 'POST',
    body: JSON.stringify({ workflowId, versionId, data })
  })
}

export const versionApi = {
  list: (workflowId) => request(`/workflows/${workflowId}/versions`),
  getActive: (workflowId) => request(`/workflows/${workflowId}/versions/active`),
  create: (workflowId, data) => request(`/workflows/${workflowId}/versions`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  activate: (workflowId, versionId, canaryRatio = 100) => 
    request(`/workflows/${workflowId}/versions/${versionId}/activate`, {
      method: 'POST',
      body: JSON.stringify({ canaryRatio })
    }),
  rollback: (workflowId, versionId) =>
    request(`/workflows/${workflowId}/versions/${versionId}/rollback`, {
      method: 'POST'
    })
}

export const executionApi = {
  list: (workflowId) => request(`/executions?workflowId=${workflowId}`),
  get: (id) => request(`/executions/${id}`),
  cancel: (id) => request(`/executions/${id}/cancel`, {
    method: 'POST'
  }),
  getLogs: (id) => request(`/executions/${id}/logs`),
  getNodeStates: (id) => request(`/executions/${id}/nodes`)
}

export const schedulerApi = {
  list: (workflowId) => request(workflowId ? `/scheduler?workflowId=${workflowId}` : '/scheduler'),
  schedule: (data) => request('/scheduler/schedule', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  cancel: (jobId) => request(`/scheduler/${jobId}/cancel`, {
    method: 'POST'
  })
}

export const eventApi = {
  list: () => request('/events'),
  trigger: (eventName, data = {}) => request('/events/trigger', {
    method: 'POST',
    body: JSON.stringify({ eventName, data })
  }),
  register: (eventName, workflowId, options = {}) => request('/events/register', {
    method: 'POST',
    body: JSON.stringify({ eventName, workflowId, options })
  }),
  remove: (listenerId) => request(`/events/${listenerId}/remove`, {
    method: 'POST'
  })
}

export default {
  workflow: workflowApi,
  version: versionApi,
  execution: executionApi,
  scheduler: schedulerApi,
  event: eventApi
}