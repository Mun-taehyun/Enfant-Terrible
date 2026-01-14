// 파일: src/apis/admin/response/adminUser.response.ts

import type { AdminUserDetail, AdminUserListItem } from "@/types/admin/user";
import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";

export type GetUsersResponse = ApiResponse<AdminPageResponse<AdminUserListItem>>;
export type GetUserDetailResponse = ApiResponse<AdminUserDetail>;
export type PatchUserStatusResponse = ApiResponse<null>;

export function unwrapApi<T>(raw: ApiResponse<T>): { success: boolean; data: T; message: string } {
  return { success: raw.success, data: raw.data, message: raw.message };
}

export function unwrapAdminPage<T>(p: AdminPageResponse<T>): {
  rows: T[];
  page: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
} {
  const rows = Array.isArray(p?.content) ? p.content : [];

  const page =
    typeof p.page === "number" ? p.page :
    typeof p.number === "number" ? p.number :
    0;

  const size =
    typeof p.size === "number" ? p.size :
    typeof p.pageSize === "number" ? p.pageSize :
    rows.length;

  return {
    rows,
    page,
    size,
    totalElements: typeof p.totalElements === "number" ? p.totalElements : undefined,
    totalPages: typeof p.totalPages === "number" ? p.totalPages : undefined,
  };
}
