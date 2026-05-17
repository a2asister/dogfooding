import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    console.error('响应错误:', error);
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || '请求失败';
      
      if (status === 401) {
        const userStore = useUserStore();
        userStore.logout();
        ElMessage.error('登录已过期，请重新登录');
      } else {
        ElMessage.error(message);
      }
    } else {
      ElMessage.error('网络错误，请稍后重试');
    }
    return Promise.reject(error);
  }
);

export default service;
