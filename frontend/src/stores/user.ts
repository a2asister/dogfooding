import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import { getCurrentUser } from '@/api/auth';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const user = ref<User | null>(null);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const setUser = (newUser: User) => {
    user.value = newUser;
  };

  const logout = () => {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
  };

  const fetchCurrentUser = async () => {
    if (!token.value) return;
    try {
      const res = await getCurrentUser();
      user.value = res.user;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      logout();
    }
  };

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    setToken,
    setUser,
    logout,
    fetchCurrentUser,
  };
});
