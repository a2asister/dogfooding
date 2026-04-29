import axios from '@/utils/axios';
import type { ApiResponse, Grade, Class } from '@/types';

export interface CreateGradeParams {
  name: string;
  year: string;
  description?: string;
}

export interface UpdateGradeParams {
  name?: string;
  year?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateClassParams {
  name: string;
  description?: string;
}

export interface UpdateClassParams {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const gradeApi = {
  getGrades: async (): Promise<ApiResponse<Grade[]>> => {
    const response = await axios.get('/grades');
    return response.data;
  },

  getGradeById: async (id: string): Promise<ApiResponse<Grade>> => {
    const response = await axios.get(`/grades/${id}`);
    return response.data;
  },

  createGrade: async (data: CreateGradeParams): Promise<ApiResponse<Grade>> => {
    const response = await axios.post('/grades', data);
    return response.data;
  },

  updateGrade: async (id: string, data: UpdateGradeParams): Promise<ApiResponse> => {
    const response = await axios.put(`/grades/${id}`, data);
    return response.data;
  },

  deleteGrade: async (id: string): Promise<ApiResponse> => {
    const response = await axios.delete(`/grades/${id}`);
    return response.data;
  },

  getClasses: async (gradeId: string): Promise<ApiResponse<Class[]>> => {
    const response = await axios.get(`/grades/${gradeId}/classes`);
    return response.data;
  },

  createClass: async (gradeId: string, data: CreateClassParams): Promise<ApiResponse<Class>> => {
    const response = await axios.post(`/grades/${gradeId}/classes`, data);
    return response.data;
  },

  updateClass: async (gradeId: string, classId: string, data: UpdateClassParams): Promise<ApiResponse> => {
    const response = await axios.put(`/grades/${gradeId}/classes/${classId}`, data);
    return response.data;
  },

  deleteClass: async (gradeId: string, classId: string): Promise<ApiResponse> => {
    const response = await axios.delete(`/grades/${gradeId}/classes/${classId}`);
    return response.data;
  },
};
