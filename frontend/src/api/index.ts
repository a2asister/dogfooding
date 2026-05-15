import axios from 'axios';
import type { Survey, SurveyResponse, SurveyAnalytics, Answer } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const surveyApi = {
  getAll: (): Promise<Survey[]> => api.get('/surveys').then((res) => res.data),
  get: (id: string): Promise<Survey> => api.get(`/surveys/${id}`).then((res) => res.data),
  getPublished: (id: string): Promise<Survey> => api.get(`/surveys/${id}/published`).then((res) => res.data),
  create: (data: Partial<Survey>): Promise<Survey> => api.post('/surveys', data).then((res) => res.data),
  update: (id: string, data: Partial<Survey>): Promise<Survey> => api.patch(`/surveys/${id}`, data).then((res) => res.data),
  delete: (id: string): Promise<void> => api.delete(`/surveys/${id}`).then((res) => res.data),
  publish: (id: string): Promise<Survey> => api.put(`/surveys/${id}/publish`).then((res) => res.data),
  unpublish: (id: string): Promise<Survey> => api.put(`/surveys/${id}/unpublish`).then((res) => res.data),
};

export const responseApi = {
  create: (data: { surveyId: string; answers: Answer[] }): Promise<SurveyResponse> =>
    api.post('/responses', data).then((res) => res.data),
  getBySurvey: (surveyId: string, includeInvalid = false): Promise<SurveyResponse[]> =>
    api.get(`/responses/survey/${surveyId}?includeInvalid=${includeInvalid}`).then((res) => res.data),
  get: (id: string): Promise<SurveyResponse> => api.get(`/responses/${id}`).then((res) => res.data),
  markInvalid: (id: string, reason: string): Promise<SurveyResponse> =>
    api.put(`/responses/${id}/invalid`, { reason }).then((res) => res.data),
};

export const analyticsApi = {
  getSurveyAnalytics: (surveyId: string): Promise<SurveyAnalytics> =>
    api.get(`/analytics/survey/${surveyId}`).then((res) => res.data),
  exportResponses: (surveyId: string): Promise<any[]> =>
    api.get(`/analytics/survey/${surveyId}/export`).then((res) => res.data),
};
