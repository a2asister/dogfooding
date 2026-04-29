import axios from '@/utils/axios';
import type { ApiResponse, PaginatedResponse, Course, CourseCategory } from '@/types';

export interface CourseQueryParams {
  categoryId?: string;
  teacherId?: string;
  status?: 'draft' | 'published' | 'archived';
  keyword?: string;
  isHot?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateCourseParams {
  name: string;
  code: string;
  categoryId: string;
  teacherId: string;
  credit: number;
  totalHours?: number;
  maxStudents?: number;
  description?: string;
  syllabus?: string;
  prerequisites?: string;
  assessmentMethod?: string;
  sortOrder?: number;
  schedules?: Array<{
    dayOfWeek: number;
    startPeriod: number;
    endPeriod: number;
    location: string;
    startWeek?: number;
    endWeek?: number;
  }>;
}

export interface UpdateCourseParams {
  name?: string;
  categoryId?: string;
  teacherId?: string;
  credit?: number;
  totalHours?: number;
  maxStudents?: number;
  description?: string;
  syllabus?: string;
  prerequisites?: string;
  assessmentMethod?: string;
  status?: 'draft' | 'published' | 'archived';
  isHot?: boolean;
  sortOrder?: number;
  schedules?: Array<{
    dayOfWeek: number;
    startPeriod: number;
    endPeriod: number;
    location: string;
    startWeek?: number;
    endWeek?: number;
  }>;
}

export const courseApi = {
  getCategories: async (): Promise<ApiResponse<CourseCategory[]>> => {
    const response = await axios.get('/courses/categories');
    return response.data;
  },

  createCategory: async (data: {
    name: string;
    code: string;
    description?: string;
    sortOrder?: number;
  }): Promise<ApiResponse<CourseCategory>> => {
    const response = await axios.post('/courses/categories', data);
    return response.data;
  },

  getCourses: async (params?: CourseQueryParams): Promise<ApiResponse<PaginatedResponse<Course>>> => {
    const response = await axios.get('/courses', { params });
    return response.data;
  },

  getPublishedCourses: async (params?: {
    categoryId?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Course>>> => {
    const response = await axios.get('/courses/published', { params });
    return response.data;
  },

  getCourseById: async (id: string): Promise<ApiResponse<Course>> => {
    const response = await axios.get(`/courses/${id}`);
    return response.data;
  },

  createCourse: async (data: CreateCourseParams): Promise<ApiResponse<Course>> => {
    const response = await axios.post('/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: UpdateCourseParams): Promise<ApiResponse> => {
    const response = await axios.put(`/courses/${id}`, data);
    return response.data;
  },

  publishCourse: async (id: string): Promise<ApiResponse> => {
    const response = await axios.post(`/courses/${id}/publish`);
    return response.data;
  },

  archiveCourse: async (id: string): Promise<ApiResponse> => {
    const response = await axios.post(`/courses/${id}/archive`);
    return response.data;
  },
};
