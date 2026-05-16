import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export interface User {
  id: number;
  username: string;
  avatar?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref(localStorage.getItem('token') || '');
  const toasts = ref<Toast[]>([]);
  const isLoading = ref(false);

  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser);
    } catch (e) {
      console.error('解析用户信息失败:', e);
    }
  }

  const isLoggedIn = computed(() => !!token.value);

  const showToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    toasts.value.push({ id, type, message });
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    }, 3000);
  };

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const setUser = (newUser: User) => {
    user.value = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    user.value = null;
    token.value = '';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  return {
    user,
    token,
    toasts,
    isLoading,
    isLoggedIn,
    setToken,
    setUser,
    logout,
    setLoading,
    showToast
  };
});
