// src/types/admin/api.ts

/** 백엔드 공통 래핑: ApiResponse.success(...) */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

/** 관리자 페이징 응답 */
export type AdminPageResponse<T> = {
  page: number;
  size: number;
  totalCount: number;
  list: T[];
};
