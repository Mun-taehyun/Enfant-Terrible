// src/types/admin/point.ts

/** 포인트 조정 요청(백 AdminPointAdjustRequest 1:1) */
export type AdminPointAdjustRequest = {
  amount: number;          // @NotNull, 0 가능 여부는 백 비즈니스 로직에 따름
  reason?: string;         // nullable 가능
  refType?: string;        // nullable 가능
  refId?: number;          // nullable 가능 (프론트에서는 null 대신 undefined 권장)
};

/** 관리자 포인트 잔액 응답(data) */
export type AdminPointBalanceResponse = {
  balance: number;
};

/** 백: sortBy String (POINT_HISTORY_ID / CREATED_AT) */
export type AdminPointHistorySortBy = "POINT_HISTORY_ID" | "CREATED_AT";

/** 백: direction String (ASC / DESC) */
export type AdminPointHistoryDirection = "ASC" | "DESC";

/** 포인트 히스토리 조회 파라미터(백 AdminPointHistoryRequest 1:1) */
export type AdminPointHistoryParams = {
  page: number; // default 1
  size: number; // default 20
  sortBy: AdminPointHistorySortBy; // 백이 String이지만 값은 두 개로 제한하는 게 안전
  direction: AdminPointHistoryDirection; // 백이 String이지만 값은 두 개로 제한
};

/** 히스토리 아이템(백 AdminPointHistoryResponse 1:1) */
export type AdminPointHistoryItem = {
  pointHistoryId: number;
  userId: number;

  pointAmount: number;     // Integer
  pointType: string;

  reason: string | null;
  refType: string | null;
  refId: number | null;

  createdAt: string;       // LocalDateTime -> ISO 문자열로 내려온다고 가정(프론트에서는 string으로 받는 게 정석)
};

/** 페이지 응답(data) (백 AdminPageResponse<T> 1:1) */
export type AdminPointHistoryPageResponse = {
  page: number;
  size: number;
  totalCount: number;
  list: AdminPointHistoryItem[];
};
