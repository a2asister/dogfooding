import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: {
    username: string;
    password: string;
    nickname: string;
    role: string;
    email?: string;
    phone?: string;
  }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: {
    nickname?: string;
    avatar?: string;
    email?: string;
    phone?: string;
  }) => api.put('/auth/profile', data),
};

export const coursesAPI = {
  getCourses: (params?: { level?: string; isPublic?: boolean; teacherId?: string }) =>
    api.get('/courses', { params }),
  getMyCourses: () => api.get('/courses/my'),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  createCourse: (data: {
    title: string;
    description: string;
    level: string;
    content: string;
    thumbnail?: string;
    isPublic?: boolean;
  }) => api.post('/courses', data),
  updateCourse: (id: string, data: Partial<{
    title: string;
    description: string;
    level: string;
    content: string;
    thumbnail?: string;
    isPublic?: boolean;
  }>) => api.put(`/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
  enrollCourse: (id: string) => api.post(`/courses/${id}/enroll`),
  updateProgress: (id: string, progress: number) =>
    api.put(`/courses/${id}/progress`, { progress }),
};

export const classesAPI = {
  getClasses: () => api.get('/classes'),
  getClass: (id: string) => api.get(`/classes/${id}`),
  createClass: (data: { name: string; description?: string; teacherId?: string }) =>
    api.post('/classes', data),
  updateClass: (id: string, data: { name?: string; description?: string }) =>
    api.put(`/classes/${id}`, data),
  deleteClass: (id: string) => api.delete(`/classes/${id}`),
  addStudent: (id: string, studentId: string) =>
    api.post(`/classes/${id}/add-student`, { studentId }),
  removeStudent: (id: string, studentId: string) =>
    api.post(`/classes/${id}/remove-student`, { studentId }),
};

export const homeworkAPI = {
  getHomework: () => api.get('/homework'),
  getHomeworkDetail: (id: string) => api.get(`/homework/${id}`),
  getSubmissions: (id: string) => api.get(`/homework/${id}/submissions`),
  createHomework: (data: {
    title: string;
    description: string;
    courseId: string;
    classId: string;
    deadline: string;
  }) => api.post('/homework', data),
  updateHomework: (id: string, data: Partial<{
    title: string;
    description: string;
    courseId: string;
    classId: string;
    deadline: string;
  }>) => api.put(`/homework/${id}`, data),
  deleteHomework: (id: string) => api.delete(`/homework/${id}`),
  submitHomework: (id: string, data: { content: string; code: string }) =>
    api.post(`/homework/${id}/submit`, data),
  gradeSubmission: (id: string, submissionId: string, data: { score: number; comment?: string }) =>
    api.put(`/homework/${id}/grade/${submissionId}`, data),
};

export const challengesAPI = {
  getChallenges: (params?: { level?: string; completed?: boolean }) =>
    api.get('/challenges', { params }),
  getMyProgress: () => api.get('/challenges/my-progress'),
  getChallenge: (id: string) => api.get(`/challenges/${id}`),
  createChallenge: (data: {
    title: string;
    description: string;
    level: string;
    content: string;
    expectedOutput?: string;
    points?: number;
  }) => api.post('/challenges', data),
  updateChallenge: (id: string, data: Partial<{
    title: string;
    description: string;
    level: string;
    content: string;
    expectedOutput?: string;
    points?: number;
  }>) => api.put(`/challenges/${id}`, data),
  deleteChallenge: (id: string) => api.delete(`/challenges/${id}`),
  submitChallenge: (id: string, data: { code: string; output?: string }) =>
    api.post(`/challenges/${id}/submit`, data),
};

export const projectsAPI = {
  getProjects: (params?: { isPublic?: boolean; category?: string; studentId?: string }) =>
    api.get('/projects', { params }),
  getProject: (id: string) => api.get(`/projects/${id}`),
  createProject: (data: {
    title: string;
    description?: string;
    code: string;
    blocksXml: string;
    isPublic?: boolean;
    category?: string;
  }) => api.post('/projects', data),
  updateProject: (id: string, data: Partial<{
    title: string;
    description?: string;
    code: string;
    blocksXml: string;
    isPublic?: boolean;
    category?: string;
  }>) => api.put(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
  likeProject: (id: string) => api.post(`/projects/${id}/like`),
};

export const wrongQuestionsAPI = {
  getQuestions: () => api.get('/wrong-questions'),
  addQuestion: (data: {
    challengeId?: string;
    homeworkId?: string;
    questionTitle: string;
    wrongCode: string;
    correctCode?: string;
    note?: string;
  }) => api.post('/wrong-questions', data),
  updateQuestion: (id: string, data: { correctCode?: string; note?: string }) =>
    api.put(`/wrong-questions/${id}`, data),
  deleteQuestion: (id: string) => api.delete(`/wrong-questions/${id}`),
};

export const statsAPI = {
  getStudentStats: () => api.get('/stats/student'),
  getTeacherStats: () => api.get('/stats/teacher'),
  getAdminStats: () => api.get('/stats/admin'),
  getParentStats: (studentId: string) => api.get(`/stats/parent/${studentId}`),
};

export const adminAPI = {
  getUsers: (params?: { role?: string; page?: number; pageSize?: number }) =>
    api.get('/admin/users', { params }),
  createUser: (data: {
    username: string;
    password: string;
    nickname: string;
    role: string;
    email?: string;
    phone?: string;
  }) => api.post('/admin/users', data),
  updateUser: (id: string, data: {
    nickname?: string;
    role?: string;
    email?: string;
    phone?: string;
    password?: string;
  }) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getBadges: () => api.get('/admin/badges'),
  createBadge: (data: {
    name: string;
    description: string;
    icon: string;
    condition: string;
  }) => api.post('/admin/badges', data),
  updateBadge: (id: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    condition?: string;
  }) => api.put(`/admin/badges/${id}`, data),
  deleteBadge: (id: string) => api.delete(`/admin/badges/${id}`),
  getSystemConfig: () => api.get('/admin/system-config'),
  initData: () => api.post('/admin/init-data'),
};

export const notificationsAPI = {
  getNotifications: (params?: { unread?: boolean }) =>
    api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
