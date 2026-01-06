/**
 * LEGACY
 * 관리자 로그인 axios 버전
 * 백엔드 연동 시 adminAuth.api.ts 대체 예정
 * 
 * ⚠️ 현재는 컴파일 대상에서 제외
 * ⚠️ axios / errorHandler 연결 전 참고용
 */

// import { axiosInstance } from '@/apis/core/axiosInstance';
// import { handleApiError } from '@/apis/core/errorHandler';

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  adminName: string;
}

/*
export const login = async (
  payload: LoginRequest
): Promise<LoginResponse> => {
  try {
    const res = await axiosInstance.post<LoginResponse>(
      '/admin/login',
      payload
    );
    return res.data;
  } catch (e) {
    return handleApiError(e);
  }
};
*/