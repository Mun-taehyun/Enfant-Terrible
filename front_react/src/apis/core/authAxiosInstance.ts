// apis/core/authAxiosInstance.ts

/*
  authAxiosInstance.ts
  --------------------
  “이 파일은 axios를 공통으로 관리하기 위한 인스턴스입니다.
  기본 통신 설정을 한 곳에 모아두고,
  이후 인증 토큰이나 에러 처리 같은 공통 로직을
  여기서 확장하기 위한 목적입니다.”
*/

import axios from 'axios';

const authAxiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // 스프링부트 서버 주소
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default authAxiosInstance;