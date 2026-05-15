import { ButtonAnimationConfig } from '../types';

const API_BASE = 'http://localhost:38765/api';

export const api = {
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  },

  async getTemplates(): Promise<ButtonAnimationConfig[]> {
    const response = await fetch(`${API_BASE}/templates`);
    return response.json();
  },

  async getTemplate(id: string): Promise<ButtonAnimationConfig> {
    const response = await fetch(`${API_BASE}/templates/${id}`);
    return response.json();
  },

  async createTemplate(config: ButtonAnimationConfig): Promise<ButtonAnimationConfig> {
    const response = await fetch(`${API_BASE}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建模板失败');
    }
    return response.json();
  },

  async updateTemplate(id: string, config: ButtonAnimationConfig): Promise<ButtonAnimationConfig> {
    const response = await fetch(`${API_BASE}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新模板失败');
    }
    return response.json();
  },

  async deleteTemplate(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/templates/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  async bulkImport(templates: ButtonAnimationConfig[]): Promise<ButtonAnimationConfig[]> {
    const response = await fetch(`${API_BASE}/templates/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templates)
    });
    return response.json();
  },

  async exportAll(): Promise<{ exportDate: string; version: string; count: number; templates: ButtonAnimationConfig[] }> {
    const response = await fetch(`${API_BASE}/templates/export/all`);
    return response.json();
  }
};
