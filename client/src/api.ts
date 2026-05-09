import { Plant, CareRecord, CareType, MonthlyStats, NextCare } from './types';

const API_BASE = '/api';

export const plantApi = {
  getAll: async (): Promise<Plant[]> => {
    const res = await fetch(`${API_BASE}/plants`);
    return res.json();
  },

  getById: async (id: string): Promise<Plant> => {
    const res = await fetch(`${API_BASE}/plants/${id}`);
    return res.json();
  },

  create: async (data: {
    name: string;
    species?: string;
    note?: string;
    avatarUrl?: string;
    wateringDays: number;
    fertilizingDays?: number;
    fertilizingEnabled?: boolean;
    pruningDays?: number;
    pruningEnabled?: boolean;
  }): Promise<Plant> => {
    const res = await fetch(`${API_BASE}/plants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id: string, data: Partial<{
    name: string;
    species: string;
    note: string;
    avatarUrl: string;
    wateringDays: number;
    fertilizingDays: number;
    fertilizingEnabled: boolean;
    pruningDays: number;
    pruningEnabled: boolean;
  }>): Promise<Plant> => {
    const res = await fetch(`${API_BASE}/plants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/plants/${id}`, { method: 'DELETE' });
  },

  getRecords: async (id: string): Promise<CareRecord[]> => {
    const res = await fetch(`${API_BASE}/plants/${id}/records`);
    return res.json();
  },

  getNextCare: async (id: string): Promise<NextCare> => {
    const res = await fetch(`${API_BASE}/plants/${id}/next-care`);
    return res.json();
  }
};

export const recordApi = {
  create: async (data: {
    plantId: string;
    type: CareType;
    note?: string;
    photoUrl?: string;
  }): Promise<CareRecord> => {
    const res = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' });
  }
};

export const statsApi = {
  getMonthly: async (month?: string): Promise<MonthlyStats> => {
    const url = month 
      ? `${API_BASE}/stats/monthly?month=${encodeURIComponent(month)}`
      : `${API_BASE}/stats/monthly`;
    const res = await fetch(url);
    return res.json();
  }
};