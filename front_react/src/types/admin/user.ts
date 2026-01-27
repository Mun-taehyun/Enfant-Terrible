// src/types/admin/user.ts

export type AdminUserId = number;

/** 백엔드 enum(UserStatus)와 정확히 일치 */
export type AdminUserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export const ADMIN_USER_STATUS_OPTIONS: Array<{ value: AdminUserStatus; label: string }> = [
  { value: "ACTIVE", label: "정상" },
  { value: "SUSPENDED", label: "정지" },
  { value: "DELETED", label: "탈퇴" },
];

export const ADMIN_USER_STATUS_LABEL: Record<AdminUserStatus, string> = {
  ACTIVE: "정상",
  SUSPENDED: "정지",
  DELETED: "탈퇴",
};

/** GET /api/admin/users 응답 아이템(AdminUserListResponse) */
export type AdminUserListItem = {
  userId: AdminUserId;
  email: string;
  name: string | null;

  role: string | null;      // USER / ADMIN
  status: AdminUserStatus;  // ACTIVE / SUSPENDED / DELETED
  provider: string | null;  // LOCAL / GOOGLE / NAVER

  createdAt: string | null;    // LocalDateTime -> 문자열
  lastLoginAt: string | null;  // LocalDateTime -> 문자열
};

/** AdminUserPetResponse */
export type AdminUserPet = {
  petId: number;
  name: string | null;
  species: string | null;
  breed: string | null;

  age: number | null;
  gender: string | null;
  isNeutered: boolean | null;

  activityLevel: number | null;
  weight: number | null;
};

/** GET /api/admin/users/{userId} 응답(AdminUserDetailResponse) */
export type AdminUserDetail = {
  userId: AdminUserId;
  email: string;
  name: string | null;
  tel: string | null;

  role: string | null;
  status: AdminUserStatus;
  provider: string | null;

  emailVerified: boolean | null;

  createdAt: string | null;
  lastLoginAt: string | null;

  pets: AdminUserPet[]; // DTO에 존재
};

/** GET /api/admin/users 검색 파라미터(AdminUserSearchRequest) */
export type AdminUserSearchRequest = {
  page: number; // 1-based
  size: number;

  email?: string;
  name?: string;
  status?: AdminUserStatus;
  provider?: string;

  createdFrom?: string; // LocalDateTime을 문자열로 전달(백엔드가 받는 포맷에 맞춰야 함)
  createdTo?: string;
};

/** PATCH /api/admin/users/{userId}/status 요청(AdminUserStatusUpdateRequest) */
export type AdminUserStatusUpdateRequest = {
  status: AdminUserStatus;
};
