import axios from 'axios';

const API_BASE_URL = 'http://localhost:61537';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ProjectData {
  name: string;
  pageStructure: string;
  animationConfig: string;
  responsiveConfig: string;
  scrollCalibration: number;
  isAutoSave: boolean;
}

interface Project {
  id: string;
  name: string;
  pageStructure: string;
  animationConfig: string;
  responsiveConfig: string;
  scrollCalibration: number;
  isAutoSave: boolean;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  async createProject(data: ProjectData): Promise<Project> {
    const response = await apiClient.post<Project>('/projects', data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<ProjectData>): Promise<Project> {
    const response = await apiClient.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },

  async getProjects(): Promise<Project[]> {
    const response = await apiClient.get<Project[]>('/projects');
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  async calculateResponsive(id: string, deviceType: string): Promise<any> {
    const response = await apiClient.post(`/projects/${id}/calculate-responsive`, { deviceType });
    return response.data;
  },

  async calibrateScroll(id: string, scrollProgress: number): Promise<any> {
    const response = await apiClient.post(`/projects/${id}/calibrate-scroll`, { scrollProgress });
    return response.data;
  },
};
