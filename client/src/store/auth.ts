import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import request from '../utils/request';

interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserInfo: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (username: string, password: string) => {
        const data = (await request.post('/auth/login', { username, password })) as any;
        set({ token: data.token, user: data.user });
        localStorage.setItem('token', data.token);
      },
      logout: () => {
        set({ token: null, user: null });
        localStorage.removeItem('token');
      },
      fetchUserInfo: async () => {
        const user = (await request.get('/auth/userinfo')) as User;
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
