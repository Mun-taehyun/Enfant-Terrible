// 파일: src/query/admin/adminUser.query.ts
import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  AdminUserId,
  AdminUserSearchRequest,
  AdminUserStatusUpdateRequest,
} from "../../types/admin/user";

import {
  requestAdminUsers,
  requestAdminUserDetail,
  requestUpdateAdminUserStatus,
} from "../../apis/admin/request/adminUser.request";

export const adminUserKeys = {
  all: ["adminUsers"] as const,
  list: (params: AdminUserSearchRequest) => ["adminUsers", "list", params] as const,
  detail: (userId: AdminUserId) => ["adminUsers", "detail", userId] as const,
};

export function useAdminUsersQuery(params: AdminUserSearchRequest) {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => requestAdminUsers(params),
  });
}

export function useAdminUserDetailQuery(userId: AdminUserId) {
  return useQuery({
    queryKey: adminUserKeys.detail(userId),
    queryFn: () => requestAdminUserDetail(userId),
    enabled: Number.isFinite(userId),
  });
}

export function useAdminUserStatusMutation() {
  return useMutation({
    mutationFn: (v: { userId: AdminUserId; body: AdminUserStatusUpdateRequest }) =>
      requestUpdateAdminUserStatus(v.userId, v.body),
  });
}
