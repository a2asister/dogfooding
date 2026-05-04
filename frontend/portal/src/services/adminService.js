import http from '../utils/http';

const BASE_URL = '/api/admin';

const adminService = {
  getHealth: () => {
    return http.get(`${BASE_URL}/health`);
  },

  getNotices: () => {
    return http.get(`${BASE_URL}/notices`);
  },

  getNoticeById: (id) => {
    return http.get(`${BASE_URL}/notices/${id}`);
  },

  createNotice: (data) => {
    return http.post(`${BASE_URL}/notices`, data);
  },

  updateNotice: (id, data) => {
    return http.put(`${BASE_URL}/notices/${id}`, data);
  },

  deleteNotice: (id) => {
    return http.delete(`${BASE_URL}/notices/${id}`);
  },

  getDocuments: () => {
    return http.get(`${BASE_URL}/documents`);
  },

  createDocument: (data) => {
    return http.post(`${BASE_URL}/documents`, data);
  },

  getEvents: () => {
    return http.get(`${BASE_URL}/events`);
  },

  createEvent: (data) => {
    return http.post(`${BASE_URL}/events`, data);
  },
};

export default adminService;
