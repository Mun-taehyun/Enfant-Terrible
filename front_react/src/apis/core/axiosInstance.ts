// apis/core/axiosInstance.ts

/*
  axiosInstance.ts
  --------------------
  인증 관련 처리를 위한 axios axiosInstance
  요청 시 토큰을 자동으로 붙이거나,
  인증 에러를 공통 처리하기 위한 용도(확장설정)
*/

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // Spring Boot 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;