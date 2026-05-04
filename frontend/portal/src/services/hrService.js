import http from '../utils/http';

const BASE_URL = '/api/hr';

const hrService = {
  getHealth: () => {
    return http.get(`${BASE_URL}/health`);
  },

  getEmployees: () => {
    return http.get(`${BASE_URL}/employees`);
  },

  getEmployeeById: (id) => {
    return http.get(`${BASE_URL}/employees/${id}`);
  },

  createEmployee: (data) => {
    return http.post(`${BASE_URL}/employees`, data);
  },

  updateEmployee: (id, data) => {
    return http.put(`${BASE_URL}/employees/${id}`, data);
  },

  deleteEmployee: (id) => {
    return http.delete(`${BASE_URL}/employees/${id}`);
  },

  getDepartments: () => {
    return http.get(`${BASE_URL}/departments`);
  },

  createDepartment: (data) => {
    return http.post(`${BASE_URL}/departments`, data);
  },

  getAttendance: () => {
    return http.get(`${BASE_URL}/attendance`);
  },

  createAttendance: (data) => {
    return http.post(`${BASE_URL}/attendance`, data);
  },
};

export default hrService;
