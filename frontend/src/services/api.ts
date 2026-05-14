import axios from 'axios';
import type { Character, PracticeRecord, ErrorCharacter, Note } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 汉字相关 API
export const characterApi = {
  getAll: async (): Promise<Character[]> => {
    const response = await api.get<Character[]>('/characters');
    return response.data;
  },

  getOne: async (id: string): Promise<Character> => {
    const response = await api.get<Character>(`/characters/${id}`);
    return response.data;
  },

  create: async (character: Omit<Character, 'id'>): Promise<Character> => {
    const response = await api.post<Character>('/characters', character);
    return response.data;
  },
};

// 练习记录相关 API
export const practiceApi = {
  createRecord: async (record: Omit<PracticeRecord, 'id'>): Promise<PracticeRecord> => {
    const response = await api.post<PracticeRecord>('/practice/record', record);
    return response.data;
  },

  getRecords: async (): Promise<PracticeRecord[]> => {
    const response = await api.get<PracticeRecord[]>('/practice/records');
    return response.data;
  },

  getErrorCharacters: async (): Promise<ErrorCharacter[]> => {
    const response = await api.get<ErrorCharacter[]>('/practice/errors');
    return response.data;
  },
};

// 笔记相关 API
export const noteApi = {
  create: async (note: Omit<Note, 'id'>): Promise<Note> => {
    const response = await api.post<Note>('/notes', note);
    return response.data;
  },

  getAll: async (): Promise<Note[]> => {
    const response = await api.get<Note[]>('/notes');
    return response.data;
  },

  getByCharacterId: async (characterId: string): Promise<Note[]> => {
    const response = await api.get<Note[]>(`/notes/character/${characterId}`);
    return response.data;
  },

  update: async (id: string, content: string): Promise<Note> => {
    const response = await api.put<Note>(`/notes/${id}`, { content });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};

export default api;
