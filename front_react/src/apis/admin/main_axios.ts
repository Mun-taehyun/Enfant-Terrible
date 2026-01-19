// src/apis/admin/main_axios.ts
import axios from 'axios';

function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export const mainAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

mainAxios.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
