import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;

  login: (phone: string, password?: string, code?: string) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  loading: false,

  login: async (phone, _password, _code) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: 'user_001',
      phone: phone,
      nickname: '张三',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20avatar%20portrait%20of%20a%20young%20chinese%20man%20in%20business%20attire%20neutral%20background&image_size=square',
      email: 'zhangsan@example.com',
      jobStatus: 'active',
      resumeCompleteRate: 85,
      createdAt: '2024-01-15T10:30:00Z',
    };

    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    set({ isLoggedIn: true, user: mockUser, loading: false });
    return true;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ isLoggedIn: false, user: null });
  },

  checkAuthStatus: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ isLoggedIn: true, user, loading: false });
        return true;
      } catch {
        set({ isLoggedIn: false, user: null, loading: false });
        return false;
      }
    }
    
    set({ isLoggedIn: false, user: null, loading: false });
    return false;
  },

  updateUser: (userData) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));
