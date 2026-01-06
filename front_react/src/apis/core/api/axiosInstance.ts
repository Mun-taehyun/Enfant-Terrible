// core/api/axiosInstance.ts

/*
  axiosInstance.ts
  --------------------
  API 통신을 위한 공통 axios 인스턴스
  - baseURL / timeout / headers 설정
  - 추후 인증(interceptor), 에러 처리 확장 예정
*/

import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
  🔹 확장 포인트 (추후 적용)

  - 요청 인터셉터
    · Authorization 토큰 자동 주입

  - 응답 인터셉터
    · 401 / 403 공통 처리
    · errorHandler 연동
*/