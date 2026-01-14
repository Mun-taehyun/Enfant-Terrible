// src/apis/admin/response/login.response.ts

import type { ApiResponse } from '@/types/admin/api';

export const unwrapOrThrow = <T>(res: ApiResponse<T>): T => {
  if (!res.success) {
    throw new Error(res.message || '요청에 실패했습니다.');
  }
  return res.data;
};
