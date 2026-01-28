// src/querys/admin/adminUser.query.ts
import type { QueryKey } from "@tanstack/react-query";
import type {
  AdminUserId,
  AdminUserSearchRequest,
  AdminUserStatusUpdateRequest,
} from "@/types/admin/user";

import {
  getAdminUsers,
  getAdminUserDetail,
  patchAdminUserStatus,
} from "@/apis/admin/request/adminUser.request.ts";

export const adminUserKeys = {
  root: ["admin", "users"] as const,
  list: (params: AdminUserSearchRequest) => [...adminUserKeys.root, "list", params] as const,
  detail: (userId: AdminUserId) => [...adminUserKeys.root, "detail", userId] as const,
};

export function adminUsersListQuery(params: AdminUserSearchRequest) {
  return {
    queryKey: adminUserKeys.list(params) as QueryKey,
    queryFn: () => getAdminUsers(params),
    keepPreviousData: true,
  };
}

export function adminUserDetailQuery(userId: AdminUserId) {
  return {
    queryKey: adminUserKeys.detail(userId) as QueryKey,
    queryFn: () => getAdminUserDetail(userId),
    enabled: userId > 0,
  };
}

export function adminUserStatusMutation() {
  return {
    mutationFn: (vars: { userId: AdminUserId; body: AdminUserStatusUpdateRequest }) =>
      patchAdminUserStatus(vars.userId, vars.body),
  };
}
