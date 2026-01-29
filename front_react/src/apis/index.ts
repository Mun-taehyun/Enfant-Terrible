import { AUTH_LOGIN_PATH, AUTH_PATH } from "@/constant/user/route.index";
import axios from "axios";




function normalizeApiBaseUrl(raw: string | undefined): string {
  const base = (raw ?? "").trim();
  if (!base) return "/api";
  return base.endsWith("/") ? `${base}api` : `${base}/api`;
}

const API_DOMAIN = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
// const BASE_URL = "https://4eb28f5b-12e9-4051-8cf1-74cb997b3a9f.mock.pstmn.io"

const apiClient = axios.create({
  baseURL: API_DOMAIN,
  timeout: 10000,
//baseURL , timeout 
//baseURL : 
//timeout : 밀리초를 기준 (10000 = 10초)로 하며 10초가 지나면 서버요청 실패 => error.response
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
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("리프레시 토큰이 없습니다.");

  const rawBase = apiClient.defaults.baseURL ?? "/api";
  const refreshClient = axios.create({ baseURL: rawBase, timeout: 10000 });

  const { data } = await refreshClient.post("/auth/refresh", null, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  const { success, data: payload, message } = data as {
    success: boolean;
    data: { accessToken: string; refreshToken: string };
    message: string;
  };

  if (!success) throw new Error(message ?? "토큰 재발급에 실패했습니다.");
  if (!payload?.accessToken || !payload?.refreshToken) {
    throw new Error("토큰 재발급 응답이 올바르지 않습니다.");
  }

  localStorage.setItem("accessToken", payload.accessToken);
  localStorage.setItem("refreshToken", payload.refreshToken);
  return payload.accessToken;
}




// 요청 인터셉터 (accessToken 자동)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // FormData면 Content-Type 제거
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// 응답 인터셉터 (응답 데이터 , 코드에 맞는 자동 응답처리코드)
apiClient.interceptors.response.use(
  (response) => {
    // 서버 응답: { success: boolean, data: T, message: string }
    const { success, data, message } = response.data;
    console.log(success)
    console.log(data)
    console.log(message)

    // 성공(true)이면 data만 반환하여 바로 사용하게 함
    if (success) {
      // data가 null일 수도 있는(successMessage) 경우를 대비해 message 혹은 true 반환
      return data !== null ? data : message;
    }
    

    // success가 false인 경우 message를 담아 에러로 던짐
    return Promise.reject(new Error(message ?? "실패했습니다."));
  },
  async (error) => {
    // 1. 서버 응답 객체 전체를 찍어서 구조를 확인합니다.
    console.log("Error Object:", error);
    console.log("Error Response Data:", error.response?.data);

    // 2. 에러 메시지 추출 경로를 더 정밀하게 체크
    const serverMessage = error.response?.data?.message;


    //만약 인증오류가 뜨면 refresh → 재시도, 실패 시 로그인 페이지로 이동
    const serverStatus = error.response?.status === 401;
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const originalUrl = String(originalRequest?.url ?? "");

    const isAuthEndpoint =
      originalUrl.includes("/auth/login") ||
      originalUrl.includes("/auth/refresh");

    if (serverStatus && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
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
        return apiClient(originalRequest);
      } catch (refreshErr) {
        flushRefreshQueue(refreshErr, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = AUTH_PATH() + AUTH_LOGIN_PATH();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    
    // 만약 error.response가 없다면 (네트워크 자체 문제)
    if (!error.response) {
        return Promise.reject(new Error("서버에 연결할 수 없습니다. 주소나 네트워크를 확인하세요."));
    }

    return Promise.reject(new Error(serverMessage ?? "알 수 없는 서버 오류가 발생했습니다."));
  }
);

export default apiClient;