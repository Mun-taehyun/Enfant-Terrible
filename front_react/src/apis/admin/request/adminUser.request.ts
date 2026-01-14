// 파일: src/apis/admin/request/adminUser.request.ts

import axiosInstance from "../main_axios";
import type { AdminUserId, AdminUserSearchRequest, AdminUserStatusUpdateRequest } from "@/types/admin/user.ts";

import type {
  GetUsersResponse,
  GetUserDetailResponse,
  PatchUserStatusResponse,
} from "../response/adminUser.response";

import { unwrapApi, unwrapAdminPage } from "../response/adminUser.response";

const API = {
  list: "/api/admin/users",
  detail: (userId: AdminUserId) => `/api/admin/users/${userId}`,
  status: (userId: AdminUserId) => `/api/admin/users/${userId}/status`,
};

/** GET /api/admin/users */
export async function requestAdminUsers(req: AdminUserSearchRequest) {
  const res = await axiosInstance.get<GetUsersResponse>(API.list, { params: req });

  const { success, data: pageData, message } = unwrapApi(res.data);
  const page = unwrapAdminPage(pageData);

  return { success, message, ...page };
}

/** GET /api/admin/users/{userId} */
export async function requestAdminUserDetail(userId: AdminUserId) {
  const res = await axiosInstance.get<GetUserDetailResponse>(API.detail(userId));
  const { success, data, message } = unwrapApi(res.data);

  return { success, message, user: data };
}

/** PATCH /api/admin/users/{userId}/status */
export async function requestUpdateAdminUserStatus(userId: AdminUserId, body: AdminUserStatusUpdateRequest) {
  const res = await axiosInstance.patch<PatchUserStatusResponse>(API.status(userId), body);
  const { success, message } = unwrapApi(res.data);

  return { success, message };
}
