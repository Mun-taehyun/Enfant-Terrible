// src/apis/core/api/axiosInstance.ts


import axios, { AxiosHeaders } from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

function normalizeBaseURL(raw?: string): string {
  // 'http://localhost:8080' 실제로 할 때는 이렇게 주소 바꿔줘야 된다 지금은 목서버 주소
  const fallback = 'https://7cb3acb1-3774-4ae0-b5ab-cb4ffd02dfc2.mock.pstmn.io';
  const v = (raw ?? '').trim();

  if (!v) return fallback;

  // ":8080" 같은 형태(호스트 누락) 방어
  if (v.startsWith(':')) return `http://localhost${v}`;

  // "localhost:8080" 처럼 스킴이 없는 형태 방어
  if (!/^https?:\/\//i.test(v)) return `http://${v}`.replace(/\/+$/, '');

  // 끝 슬래시 제거
  return v.replace(/\/+$/, '');
}

// .env(.development) 예: VITE_API_BASE_URL=http://localhost:8080
const BASE_URL = normalizeBaseURL(import.meta.env.VITE_API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  (error: AxiosError) => Promise.reject(error)
);

export default axiosInstance;
