// src/apis/admin/reco_axios.ts
// Django 추천 서버 전용 baseURL
// .env(.env.local 등)에 VITE_RECO_API_BASE_URL로 지정합니다.
// 예: VITE_RECO_API_BASE_URL=http://localhost:8000

import axios from "axios";

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

function normalizeRecoBaseUrl(raw: string | undefined): string {
  const base = (raw ?? "").trim();
  if (!base) {
    try {
      return new URL("py", document.baseURI).toString().replace(/\/$/, "");
    } catch {
      return "/py";
    }
  }
  return base.replace(/\/$/, "");
}

export const recoAxios = axios.create({
  baseURL: normalizeRecoBaseUrl(import.meta.env.VITE_RECO_API_BASE_URL),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

recoAxios.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
