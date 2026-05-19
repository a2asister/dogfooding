import { create } from 'zustand';
import type { User } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) as User : null;
  })(),
  token: localStorage.getItem('token'),
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
  updateUser: (userData) =>
    set((state) => {
      if (state.user) {
        const updated = { ...state.user, ...userData };
        localStorage.setItem('user', JSON.stringify(updated));
        return { user: updated };
      }
      return state;
    }),
}));
