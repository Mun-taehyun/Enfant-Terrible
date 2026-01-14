// 파일: src/types/common/api.ts

/** 백엔드 공통 래핑: ApiResponse.success(...) */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

/** 관리자 페이징 응답(공용으로 쓰면 여기) */
export type AdminPageResponse<T> = {
  content?: T[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  number?: number;
  size?: number;
  pageSize?: number;
};
