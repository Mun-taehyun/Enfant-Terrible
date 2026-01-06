/**
 * legacy - 관리자 로그인 axios 버전
 * 백엔드 연동 준비 시 참고용
 */

import axios from 'axios';

interface LoginRequest {
  loginId: string;
  password: string;
}

export const loginWithAxios = async (payload: LoginRequest) => {
  return axios.post('/admin/login', payload);
};