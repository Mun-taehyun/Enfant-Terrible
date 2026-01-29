// src/apis/admin/request/adminUsers.request.ts
import { mainAxios } from "@/apis/admin/main_axios";
import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type {
  AdminUserId,
  AdminUserListItem,
  AdminUserDetail,
  AdminUserSearchRequest,
  AdminUserStatusUpdateRequest,
} from "@/types/admin/user";

function unwrapOrThrow<T>(res: ApiResponse<T>): T {
  if (!res || res.success !== true) {
    throw new Error(res?.message || "요청에 실패했습니다.");
  }
  return res.data;
}

export async function getAdminUsers(params: AdminUserSearchRequest) {
  const { data } = await mainAxios.get<ApiResponse<AdminPageResponse<AdminUserListItem>>>(
    "/admin/users",
    { params }
  );
  return unwrapOrThrow(data);
}

export async function getAdminUserDetail(userId: AdminUserId) {
  const { data } = await mainAxios.get<ApiResponse<AdminUserDetail>>(
    `/admin/users/${userId}`
  );
  return unwrapOrThrow(data);
}

export async function patchAdminUserStatus(
  userId: AdminUserId,
  body: AdminUserStatusUpdateRequest
) {
  const { data } = await mainAxios.patch<ApiResponse<null>>(
    `/admin/users/${userId}/status`,
    body
  );
  unwrapOrThrow(data);
}
