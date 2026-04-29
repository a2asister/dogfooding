import axios from '@/utils/axios';
import type { ApiResponse, CourseCategory } from '@/types';

export interface CreateCategoryParams {
  name: string;
  code: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryParams {
  name?: string;
  code?: string;
  description?: string;
  sortOrder?: number;
}

export const categoryApi = {
  getCategories: async (): Promise<ApiResponse<CourseCategory[]>> => {
    const response = await axios.get('/courses/categories');
    return response.data;
  },

  createCategory: async (data: CreateCategoryParams): Promise<ApiResponse<CourseCategory>> => {
    const response = await axios.post('/courses/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: UpdateCategoryParams): Promise<ApiResponse> => {
    const response = await axios.put(`/courses/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse> => {
    const response = await axios.delete(`/courses/categories/${id}`);
    return response.data;
  },
};
