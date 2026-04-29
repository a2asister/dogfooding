import axios from '@/utils/axios';
import type { ApiResponse, CourseSelection, CourseFavorite } from '@/types';

export interface ConflictCourse {
  id: string;
  name: string;
  schedules: Array<{
    dayOfWeek: number;
    startPeriod: number;
    endPeriod: number;
  }>;
}

export const electiveApi = {
  getMySelections: async (batchId: string): Promise<ApiResponse<CourseSelection[]>> => {
    const response = await axios.get('/elective/my-selections', { params: { batchId } });
    return response.data;
  },

  getMyFavorites: async (): Promise<ApiResponse<CourseFavorite[]>> => {
    const response = await axios.get('/elective/my-favorites');
    return response.data;
  },

  selectCourse: async (data: {
    courseId: string;
    batchId: string;
  }): Promise<ApiResponse> => {
    const response = await axios.post('/elective/select', data);
    return response.data;
  },

  dropCourse: async (data: {
    courseId: string;
    batchId: string;
  }): Promise<ApiResponse> => {
    const response = await axios.post('/elective/drop', data);
    return response.data;
  },

  toggleFavorite: async (courseId: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
    const response = await axios.post('/elective/toggle-favorite', { courseId });
    return response.data;
  },

  checkConflict: async (data: {
    courseId: string;
    batchId: string;
  }): Promise<ApiResponse<{ conflict: boolean; conflictingCourse?: ConflictCourse }>> => {
    const response = await axios.post('/elective/check-conflict', data);
    return response.data;
  },
};
