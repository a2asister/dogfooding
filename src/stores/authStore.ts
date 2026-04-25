import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StorageService } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import type { User, UserRole } from '../types';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const roleDescriptions: Record<UserRole, string> = {
  admin: '医院管理员',
  medical: '医护医技',
  charge: '收费后勤',
  patient: '就诊患者',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (username: string, password: string) => {
        const users = StorageService.getAll<User>(STORAGE_KEYS.USERS);
        const user = users.find((u) => u.username === username && u.password === password);

        if (!user) {
          return { success: false, message: '用户名或密码错误' };
        }

        set({
          currentUser: user,
          isAuthenticated: true,
        });

        StorageService.logOperation(
          user.id,
          user.name,
          user.role,
          '系统登录',
          '登录',
          '用户',
          user.id,
          `用户 ${user.name} (${roleDescriptions[user.role]}) 登录系统`
        );

        return { success: true, message: '登录成功' };
      },

      logout: () => {
        const { currentUser } = get();
        if (currentUser) {
          StorageService.logOperation(
            currentUser.id,
            currentUser.name,
            currentUser.role,
            '系统登录',
            '登出',
            '用户',
            currentUser.id,
            `用户 ${currentUser.name} 退出系统`
          );
        }
        set({
          currentUser: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const updatedUser = StorageService.update<User>(
          STORAGE_KEYS.USERS,
          currentUser.id,
          updates
        );

        if (updatedUser) {
          set({ currentUser: updatedUser });
        }
      },
    }),
    {
      name: 'hospital-auth-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { roleDescriptions };
