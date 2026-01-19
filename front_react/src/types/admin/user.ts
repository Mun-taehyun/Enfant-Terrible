// src/types/admin/user.ts

export type AdminUserId = number;

/** 상태 코드(서버로 보내는 값) */
export type AdminUserStatus = "ACTIVE" | "SUSPENDED" | "WITHDRAWN";

/** 검색 요청 */
export interface AdminUserSearchRequest {
  page?: number;
  size?: number;
  email?: string;
  name?: string;
  status?: AdminUserStatus;
}

/** 상태 변경 요청(PATCH /status) */
export interface AdminUserStatusUpdateRequest {
  status: AdminUserStatus;
}

/** 리스트용 아이템 */
export interface AdminUserListItem {
  userId: AdminUserId;
  email: string;
  name: string;
  status: AdminUserStatus;
  role: string;
}

/** 상세 정보용 */
export interface AdminUserDetail {
  userId: AdminUserId;
  email: string;
  name: string;
  tel: string;
  address: string;
  role: string;
  status: AdminUserStatus;
  lastLoginAt: string | null;
}

export interface AdminUsersListResult {
  success: boolean;
  message: string;
  rows: AdminUserListItem[];
  page: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
}

export interface AdminUserDetailResult {
  success: boolean;
  message: string;
  user: AdminUserDetail;
}

/** 화면 표시용(선택: status 표시/드롭다운에 쓰면 유지) */
export const ADMIN_USER_STATUS_LABEL: Record<AdminUserStatus, string> = {
  ACTIVE: "정지 해제",
  SUSPENDED: "정지",
  WITHDRAWN: "탈퇴",
};

export const ADMIN_USER_STATUS_OPTIONS: { value: AdminUserStatus; label: string }[] = [
  { value: "ACTIVE", label: "정지 해제" },
  { value: "SUSPENDED", label: "정지" },
  { value: "WITHDRAWN", label: "탈퇴" },
];
