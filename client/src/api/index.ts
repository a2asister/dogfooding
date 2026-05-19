import request from '../utils/request';
import type { User, DashboardData, Schedule, Course, Evaluation, Message, News, LoginRecord } from '../types';

export const authApi = {
  login: (data: { studentId: string; password: string }) =>
    request.post<any, { token: string; user: User }>('/auth/login', data),
  logout: () => request.post('/auth/logout'),
  getCurrentUser: () => request.get<any, User>('/auth/info'),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    request.post('/auth/password', data),
};

export const studentApi = {
  getDashboard: () => request.get<any, DashboardData>('/student/dashboard'),
  getSchedule: () => request.get<any, Schedule[]>('/student/schedule'),
  getGrades: (params?: { semester?: string }) => request.get('/student/grades', { params }),
  getCourses: () => request.get<any, { availableCourses: Course[]; selectedCourses: Course[] }>('/student/courses'),
  selectCourse: (id: number) => request.post(`/student/courses/${id}/select`),
  dropCourse: (id: number) => request.delete(`/student/courses/${id}/drop`),
  getEvaluations: () => request.get<any, { pending: Evaluation[]; history: Evaluation[] }>('/student/evaluations'),
  submitEvaluation: (id: number, data: any) => request.post(`/student/evaluations/${id}`, data),
  getMessages: (params?: { type?: string; isRead?: string }) => request.get<any, Message[]>('/student/messages', { params }),
  readMessage: (id: number) => request.post(`/student/messages/${id}/read`),
  getProfile: () => request.get('/student/profile'),
  getLoginRecords: () => request.get<any, LoginRecord[]>('/student/login-records'),
};

export const portalApi = {
  getNewsList: (params?: { category?: string; page?: number; pageSize?: number }) =>
    request.get('/news/list', { params }),
  getNewsDetail: (id: number) => request.get<any, News>(`/news/${id}`),
  getOverview: () => request.get('/portal/overview'),
};
