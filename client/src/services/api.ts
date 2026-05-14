import type { FissionConfig, SavedWork, Template, CreationRecord } from '~/types/geometric';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  saveWork: (name: string, config: FissionConfig, thumbnail: string) =>
    request<SavedWork>('/works', {
      method: 'POST',
      body: JSON.stringify({ name, config, thumbnail }),
    }),

  getWorks: () => request<SavedWork[]>('/works'),

  deleteWork: (id: number) =>
    request<void>(`/works/${id}`, { method: 'DELETE' }),

  saveTemplate: (name: string, config: FissionConfig, thumbnail: string, category: string) =>
    request<Template>('/templates', {
      method: 'POST',
      body: JSON.stringify({ name, config, thumbnail, category }),
    }),

  getTemplates: () => request<Template[]>('/templates'),

  getCreationRecords: () => request<CreationRecord[]>('/records'),

  addCreationRecord: (workId: number, action: string) =>
    request<CreationRecord>('/records', {
      method: 'POST',
      body: JSON.stringify({ workId, action }),
    }),
};
