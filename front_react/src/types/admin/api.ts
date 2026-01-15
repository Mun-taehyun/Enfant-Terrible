// src/types/admin/api.ts

/** 백엔드 공통 래핑: ApiResponse.success(...) */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

/** 관리자 페이징 응답 */
export type AdminPageResponse<T> = {
  // 페이지 데이터 배열 키(백 응답에 따라 다를 수 있어서 넓힘)
  content?: T[];
  rows?: T[];
  items?: T[];

  totalElements?: number;
  totalPages?: number;

  // page index
  page?: number;
  number?: number;

  // page size
  size?: number;
  pageSize?: number;
};
