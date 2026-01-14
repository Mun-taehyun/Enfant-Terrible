// src/apis/admin/request/login.request.ts

// mainAxios 위치는 "실제 파일 위치"에 맞춰 아래 한 줄만 맞추시면 됩니다.
// (성일님이 올려주신 기준은 src/apis/main_axios.ts 였으니 일단 그 기준으로 둡니다)
import { mainAxios } from '@/apis/admin/main_axios';

import type { ApiResponse } from '@/types/admin/api';
import type { AdminLoginRequest, AdminLoginResponse } from '@/types/admin/login';
import { unwrapOrThrow } from '../response/login.response';

export const adminSignIn = async (payload: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const { data } = await mainAxios.post<ApiResponse<AdminLoginResponse>>(
    '/admin/auth/sign-in',
    payload
  );

  return unwrapOrThrow(data);
};
