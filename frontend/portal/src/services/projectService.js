import http from '../utils/http';

const BASE_URL = '/api/project';

const projectService = {
  getHealth: () => {
    return http.get(`${BASE_URL}/health`);
  },

  getProjects: () => {
    return http.get(`${BASE_URL}/projects`);
  },

  getProjectById: (id) => {
    return http.get(`${BASE_URL}/projects/${id}`);
  },

  createProject: (data) => {
    return http.post(`${BASE_URL}/projects`, data);
  },

  updateProject: (id, data) => {
    return http.put(`${BASE_URL}/projects/${id}`, data);
  },

  deleteProject: (id) => {
    return http.delete(`${BASE_URL}/projects/${id}`);
  },

  getTasks: () => {
    return http.get(`${BASE_URL}/tasks`);
  },

  createTask: (data) => {
    return http.post(`${BASE_URL}/tasks`, data);
  },

  getMilestones: () => {
    return http.get(`${BASE_URL}/milestones`);
  },

  createMilestone: (data) => {
    return http.post(`${BASE_URL}/milestones`, data);
  },
};

export default projectService;
