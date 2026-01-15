// 파일: src/types/admin/user.ts

export type AdminUserId = number;

/**
 * 사용자 상태 (백엔드 enum/코드 확정되면 string -> union으로 잠그세요)
 * 예: "ACTIVE" | "SUSPENDED" | "WITHDRAWN"
 */
export type AdminUserStatus = string;

/**
 * 관리자 - 사용자 목록 아이템
 * (AdminUserListResponse DTO 필드 확정되면 여기에 추가)
 */
export type AdminUserListItem = {
  userId: AdminUserId;
  // TODO: email, name, status, createdAt ... 등 실제 DTO 필드로 확정
};

/**
 * 관리자 - 사용자 상세
 * (AdminUserDetailResponse DTO 필드 확정되면 여기에 추가)
 */
export type AdminUserDetail = {
  userId: AdminUserId;
  // TODO: 실제 DTO 필드로 확정
};

/**
 * 관리자 - 사용자 목록 조회 QueryString
 * (백엔드 AdminUserSearchRequest DTO 필드 확정되면 여기 타입을 정확히 잠그세요)
 */
export type AdminUserSearchRequest = {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
};

/** 관리자 - 사용자 상태 변경 Body */
export type AdminUserStatusUpdateRequest = {
  status: AdminUserStatus;
};

/* =========================
 * ✅ request가 반환하는 "프론트에서 쓰는 결과 타입"
 * (뷰에서 data.rows/data.page/data.message 접근이 안전해짐)
 * ========================= */

export type AdminUsersListResult = {
  success: boolean;
  message: string;
  rows: AdminUserListItem[];
  page: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
};

export type AdminUserDetailResult = {
  success: boolean;
  message: string;
  user: AdminUserDetail;
};

export type AdminUserStatusUpdateResult = {
  success: boolean;
  message: string;
};
