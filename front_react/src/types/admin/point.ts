// src/types/admin/point.ts

/** 포인트 조정 요청 */
export type AdminPointAdjustRequest = {
  amount: number;
  reason: string;
};

/** 관리자 포인트 잔액 응답에서 data에 해당하는 형태 */
export type AdminPointBalanceResponse = {
  balance: number;
};

/** 포인트 히스토리 조회 파라미터 */
export type AdminPointHistoryParams = {
  page: number;
  size: number;
};

/** 포인트 히스토리 아이템(백 DTO에 맞춰 확정되면 필드 고정) */
export type AdminPointHistoryItem = {
  // 아래는 일반적으로 쓰는 필드 예시입니다.
  // 백엔드 DTO 확정되면 정확한 필드명으로 교체하세요.
  pointId?: number;
  userId?: number;
  amount?: number;
  reason?: string;
  createdAt?: string; // ISO string
};
