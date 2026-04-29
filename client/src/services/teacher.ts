import axios from '@/utils/axios';
import type { ApiResponse, PaginatedResponse, Course, CourseCategory, User } from '@/types';

export interface TeacherCourse {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  teacherId: string;
  credit: number;
  totalHours?: number;
  maxStudents?: number;
  maxCapacity?: number;
  currentStudents?: number;
  enrolledCount?: number;
  description?: string;
  syllabus?: string;
  prerequisites?: string;
  assessmentMethod?: string;
  status: 'draft' | 'published' | 'archived';
  isHot?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  category?: CourseCategory | {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    name: string;
    teacherNo?: string;
  };
  schedules?: Array<{
    id: string;
    dayOfWeek: number;
    startPeriod: number;
    endPeriod: number;
    location: string;
  }>;
}

export interface CourseSelectionWithStudent {
  id: string;
  studentId: string;
  courseId: string;
  batchId: string;
  status: 'selected' | 'dropped' | 'completed';
  score?: number | null;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F' | null;
  isPassed?: boolean | null;
  comment?: string | null;
  gradedAt?: string | null;
  isGraded?: boolean;
  selectedAt?: string;
  droppedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  course?: Course;
  student?: User | {
    id: string;
    name: string;
    studentNo: string;
    email?: string;
    phone?: string;
    grade?: { name: string };
    class?: { name: string };
  };
  batch?: {
    id: string;
    name: string;
  };
}

export interface UpdateGradeParams {
  score?: number;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  isPassed?: boolean;
  comment?: string;
}

export const teacherApi = {
  getMyCourses: async (params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<TeacherCourse>>> => {
    const response = await axios.get('/teacher/my-courses', { params });
    return response.data;
  },

  getCourseSelections: async (courseId: string, batchId?: string): Promise<ApiResponse<CourseSelectionWithStudent[]>> => {
    const response = await axios.get(`/teacher/courses/${courseId}/selections`, { params: { batchId } });
    return response.data;
  },

  updateGrade: async (selectionId: string, data: UpdateGradeParams): Promise<ApiResponse> => {
    const response = await axios.put(`/teacher/selections/${selectionId}/grade`, data);
    return response.data;
  },

  exportGrades: async (courseId: string, batchId?: string): Promise<void> => {
    const response = await axios.get(`/teacher/courses/${courseId}/export-grades`, {
      params: { batchId },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `grades-${courseId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  getCourseStudents: async (courseId: string, batchId?: string): Promise<ApiResponse<CourseSelectionWithStudent[]>> => {
    return teacherApi.getCourseSelections(courseId, batchId);
  },

  updateScore: async (selectionId: string, data: { score?: number }): Promise<ApiResponse> => {
    return teacherApi.updateGrade(selectionId, data);
  },
};
