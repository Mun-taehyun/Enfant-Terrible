// src/types/admin/point.ts
export type AdminPointUserId = number;

export type AdminPointBalanceResponse = {
  userId: AdminPointUserId;
  balance: number;
};

export type AdminPointHistorySortBy = "POINT_HISTORY_ID" | "CREATED_AT";
export type AdminPointHistoryDirection = "ASC" | "DESC";

export type AdminPointHistoryParams = {
  page: number; // 1-base
  size: number; // 1~200
  sortBy?: AdminPointHistorySortBy;
  direction?: AdminPointHistoryDirection;
};

export type AdminPointHistoryItem = {
  pointHistoryId: number;
  userId: AdminPointUserId;

  pointAmount: number;
  pointType: string;

  reason: string | null;
  refType: string | null;
  refId: number | null;

  createdAt: string; // LocalDateTime -> ISO/string
};

export type AdminPointAdjustRequest = {
  amount: number; // @NotNull (음수도 가능)
  reason?: string;
  refType?: string;
  refId?: number | null;
};
