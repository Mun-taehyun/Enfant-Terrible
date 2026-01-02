// apis/core/axiosInstance.ts

/*
  axiosInstance.ts
  --------------------
  프로젝트 전체에서 사용하는 axios 공통 인스턴스
  baseURL, timeout, 공통 설정을 한 곳에서 관리한다.
*/

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // 스프링부트 서버 주소
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance; 