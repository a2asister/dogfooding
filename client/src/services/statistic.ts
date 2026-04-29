import axios from '@/utils/axios';
import type { ApiResponse, Course } from '@/types';

export interface OverviewStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalSelections: number;
  publishedCourses: number;
  activeBatches: number;
}

export interface CategoryStats {
  id: string;
  name: string;
  code: string;
  courseCount: number;
  totalSelections: number;
}

export interface SelectionTrend {
  date: string;
  count: number;
}

export const statisticApi = {
  getOverview: async (): Promise<ApiResponse<OverviewStats>> => {
    const response = await axios.get('/statistics/overview');
    return response.data;
  },

  getHotCourses: async (limit?: number): Promise<ApiResponse<Course[]>> => {
    const response = await axios.get('/statistics/hot-courses', { params: { limit } });
    return response.data;
  },

  getCategoryStats: async (): Promise<ApiResponse<CategoryStats[]>> => {
    const response = await axios.get('/statistics/category-stats');
    return response.data;
  },

  getSelectionTrend: async (batchId?: string): Promise<ApiResponse<SelectionTrend[]>> => {
    const response = await axios.get('/statistics/selection-trend', { params: { batchId } });
    return response.data;
  },

  exportSelectionSummary: async (batchId?: string): Promise<void> => {
    const response = await axios.get('/statistics/export/selection-summary', {
      params: { batchId },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'selection-summary.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportCourseStats: async (): Promise<void> => {
    const response = await axios.get('/statistics/export/course-stats', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'course-stats.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
