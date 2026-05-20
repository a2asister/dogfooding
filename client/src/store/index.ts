import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  realName: string;
  email: string;
  roleId: number;
  roleName: string;
  roleCode: string;
  permissions: string[];
  departmentId: number;
  departmentName: string;
  position: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));
