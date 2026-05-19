import axios from 'axios';
import type { User, Article, Question, Project, Comment, Tag, Topic, Collection, Badge, Notification, LevelConfig } from './types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', data),
  getProfile: () => api.get<User>('/auth/profile'),
  updateProfile: (data: { avatar?: string; bio?: string }) =>
    api.put('/auth/profile', data),
  checkIn: () => api.post<{ success: boolean; points: number }>('/auth/checkin'),
};

export const articlesApi = {
  getList: (params?: { page?: number; limit?: number; tag?: string; topic?: number; sort?: string }) =>
    api.get<{ data: Article[]; total: number }>('/articles', { params }),
  getDetail: (id: number) => api.get<Article>(`/articles/${id}`),
  create: (data: { title: string; content: string; summary?: string; tags?: string; topic_id?: number; collection_id?: number }) =>
    api.post<{ id: number; success: boolean }>('/articles', data),
  update: (id: number, data: { title: string; content: string; summary?: string; tags?: string }) =>
    api.put(`/articles/${id}`, data),
  delete: (id: number) => api.delete(`/articles/${id}`),
  like: (id: number) => api.post<{ liked: boolean; likes: number }>(`/articles/${id}/like`),
  favorite: (id: number) => api.post<{ favorited: boolean; favorites: number }>(`/articles/${id}/favorite`),
};

export const questionsApi = {
  getList: (params?: { page?: number; limit?: number; tag?: string; status?: string; sort?: string }) =>
    api.get<{ data: Question[]; total: number }>('/questions', { params }),
  getDetail: (id: number) => api.get<Question>(`/questions/${id}`),
  create: (data: { title: string; content: string; tags?: string }) =>
    api.post<{ id: number; success: boolean }>('/questions', data),
  answer: (id: number, data: { content: string }) =>
    api.post<{ id: number; success: boolean }>(`/questions/${id}/answers`, data),
  acceptAnswer: (id: number) =>
    api.post<{ success: boolean }>(`/questions/answers/${id}/accept`),
  likeAnswer: (id: number) =>
    api.post<{ liked: boolean }>(`/questions/answers/${id}/like`),
};

export const projectsApi = {
  getList: (params?: { page?: number; limit?: number; tag?: string; status?: string; sort?: string }) =>
    api.get<{ data: Project[]; total: number }>('/projects', { params }),
  getDetail: (id: number) => api.get<Project>(`/projects/${id}`),
  create: (data: { title: string; description: string; content: string; tags?: string; team_size?: number }) =>
    api.post<{ id: number; success: boolean }>('/projects', data),
  join: (id: number) => api.post<{ success: boolean }>(`/projects/${id}/join`),
  approveMember: (projectId: number, memberId: number) =>
    api.post<{ success: boolean }>(`/projects/${projectId}/members/${memberId}/approve`),
  addResource: (id: number, data: { title: string; description?: string; url: string; type?: string }) =>
    api.post<{ id: number; success: boolean }>(`/projects/${id}/resources`, data),
  updateProgress: (id: number, data: { progress: number }) =>
    api.put<{ success: boolean }>(`/projects/${id}/progress`, data),
  like: (id: number) => api.post<{ liked: boolean }>(`/projects/${id}/like`),
  favorite: (id: number) => api.post<{ favorited: boolean }>(`/projects/${id}/favorite`),
};

export const commentsApi = {
  getList: (params: { target_type: string; target_id: number; page?: number; limit?: number }) =>
    api.get<{ data: Comment[]; total: number }>('/comments', { params }),
  getReplies: (id: number) => api.get<{ data: Comment[] }>(`/comments/${id}/replies`),
  create: (data: { target_type: string; target_id: number; parent_id?: number; content: string }) =>
    api.post<{ id: number; success: boolean }>('/comments', data),
  like: (id: number) => api.post<{ liked: boolean }>(`/comments/${id}/like`),
  delete: (id: number) => api.delete(`/comments/${id}`),
};

export const communityApi = {
  getTags: () => api.get<{ data: Tag[] }>('/community/tags'),
  getTopics: () => api.get<{ data: Topic[] }>('/community/topics'),
  getCollections: () => api.get<{ data: Collection[] }>('/community/collections'),
  getBadges: () => api.get<{ data: Badge[] }>('/community/badges'),
  getLevels: () => api.get<{ data: LevelConfig[] }>('/community/levels'),
  getNotifications: (params?: { page?: number; limit?: number; unread?: boolean }) =>
    api.get<{ data: Notification[]; total: number }>('/community/notifications', { params }),
  getUnreadCount: () => api.get<{ count: number }>('/community/notifications/unread-count'),
  markNotificationsRead: (data?: { ids?: number[] }) =>
    api.post<{ success: boolean }>('/community/notifications/read', data),
  getUserProfile: (id: number) => api.get<User & { articles: Article[]; projects: Project[]; badges: Badge[] }>(`/community/users/${id}`),
  getRecommend: () => api.get<{ data: Article[] }>('/community/recommend'),
  getFeatured: () => api.get<{ pinned: Article[]; featured: Article[] }>('/community/featured'),
};

export const adminApi = {
  getPendingArticles: () => api.get<{ data: Article[] }>('/admin/articles/pending'),
  approveArticle: (id: number) => api.post<{ success: boolean }>(`/admin/articles/${id}/approve`),
  rejectArticle: (id: number, data?: { reason?: string }) =>
    api.post<{ success: boolean }>(`/admin/articles/${id}/reject`, data),
  pinArticle: (id: number, data: { pinned: boolean }) =>
    api.post<{ success: boolean }>(`/admin/articles/${id}/pin`, data),
  featureArticle: (id: number, data: { featured: boolean }) =>
    api.post<{ success: boolean }>(`/admin/articles/${id}/feature`, data),
  getPendingQuestions: () => api.get<{ data: Question[] }>('/admin/questions/pending'),
  approveQuestion: (id: number) => api.post<{ success: boolean }>(`/admin/questions/${id}/approve`),
  rejectQuestion: (id: number) => api.post<{ success: boolean }>(`/admin/questions/${id}/reject`),
  getUsers: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: User[]; total: number }>('/admin/users', { params }),
  banUser: (id: number, data: { banned: boolean }) =>
    api.post<{ success: boolean }>(`/admin/users/${id}/ban`, data),
  setUserRole: (id: number, data: { role: 'user' | 'admin' }) =>
    api.post<{ success: boolean }>(`/admin/users/${id}/role`, data),
  createTopic: (data: { title: string; description?: string; cover?: string }) =>
    api.post<{ id: number; success: boolean }>('/admin/topics', data),
  updateTopic: (id: number, data: { title?: string; description?: string; cover?: string; is_active?: boolean }) =>
    api.put<{ success: boolean }>(`/admin/topics/${id}`, data),
  deleteTopic: (id: number) => api.delete<{ success: boolean }>(`/admin/topics/${id}`),
  getStats: () => api.get<{ data: Record<string, number> }>('/admin/stats'),
};

export default api;
