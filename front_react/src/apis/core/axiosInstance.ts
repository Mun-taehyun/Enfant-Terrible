// apis/core/authInterceptor.ts

/*
  authInterceptor.ts
  --------------------
  인증 관련 처리를 위한 axios interceptor
  요청 시 토큰을 자동으로 붙이거나,
  인증 에러를 공통 처리하기 위한 용도
*/

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

export default axiosInstance;