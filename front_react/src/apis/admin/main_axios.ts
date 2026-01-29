// src/apis/admin/main_axios.ts
import axios from 'axios';

function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export const mainAxios = axios.create({
  baseURL: (() => {
    const base = String(import.meta.env.VITE_API_BASE_URL ?? '').trim();
    if (!base) return '/api';
    return base.endsWith('/') ? `${base}api` : `${base}/api`;
  })(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
type PendingRequest = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
let refreshQueue: PendingRequest[] = [];

function flushRefreshQueue(err: unknown, token: string | null) {
  const q = refreshQueue;
  refreshQueue = [];
  q.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(err);
  });
}

async function requestTokenRefresh(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.');

  const rawBase = mainAxios.defaults.baseURL ?? '/api';
  const refreshClient = axios.create({ baseURL: rawBase, timeout: 15000 });

  const { data } = await refreshClient.post('/auth/refresh', null, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  const { success, data: payload, message } = data as {
    success: boolean;
    data: { accessToken: string; refreshToken: string };
    message: string;
  };

  if (!success) throw new Error(message ?? '토큰 재발급에 실패했습니다.');
  if (!payload?.accessToken || !payload?.refreshToken) {
    throw new Error('토큰 재발급 응답이 올바르지 않습니다.');
  }

  localStorage.setItem('accessToken', payload.accessToken);
  localStorage.setItem('refreshToken', payload.refreshToken);
  return payload.accessToken;
}

mainAxios.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

mainAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const originalUrl = String(originalRequest?.url ?? '');

    const isAuthEndpoint = originalUrl.includes('/auth/login') || originalUrl.includes('/auth/refresh');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(mainAxios(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const newAccessToken = await requestTokenRefresh();
        flushRefreshQueue(null, newAccessToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return mainAxios(originalRequest);
      } catch (refreshErr) {
        flushRefreshQueue(refreshErr, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
