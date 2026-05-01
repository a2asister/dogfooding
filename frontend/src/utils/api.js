import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    if (response.data.code === 200) {
      return response.data;
    } else {
      console.error('API错误:', response.data.message);
      return Promise.reject(new Error(response.data.message || '请求失败'));
    }
  },
  (error) => {
    console.error('响应错误:', error);
    return Promise.reject(error);
  }
);

export default api;
