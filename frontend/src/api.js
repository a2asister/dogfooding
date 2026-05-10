const BASE_URL = '/api';

async function request(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
}

export const api = {
  getDashboard: () => request('/dashboard'),
  getActivities: () => request('/activities'),
  getActivity: (id) => request(`/activities/${id}`),
  createActivity: (data) => request('/activities', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateActivity: (id, data) => request(`/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteActivity: (id) => request(`/activities/${id}`, {
    method: 'DELETE'
  }),
  getRegistrations: (activityId) => request(`/activities/${activityId}/registrations`),
  register: (activityId, data) => request(`/activities/${activityId}/register`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  checkin: (registrationId) => request(`/registrations/${registrationId}/checkin`, {
    method: 'POST'
  }),
  checkout: (registrationId) => request(`/registrations/${registrationId}/checkout`, {
    method: 'POST'
  }),
  markAbsent: (registrationId) => request(`/registrations/${registrationId}/absent`, {
    method: 'POST'
  }),
  revertStatus: (registrationId) => request(`/registrations/${registrationId}/revert`, {
    method: 'POST'
  }),
  getActivityStats: (activityId) => request(`/activities/${activityId}/stats`),
  getUserSegments: (activityId) => request(`/activities/${activityId}/user-segments`),
  getROI: (activityId) => request(`/activities/${activityId}/roi`),
  updateROI: (activityId, data) => request(`/activities/${activityId}/roi`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  addInteraction: (activityId, data) => request(`/activities/${activityId}/interactions`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getInteractions: (activityId) => request(`/activities/${activityId}/interactions`)
};
