// src/hooks/admin/adminUsers.hook.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AdminUserId, AdminUserSearchRequest } from "@/types/admin/user";
import {
  adminUsersListQuery,
  adminUserDetailQuery,
  adminUserStatusMutation,
} from "@/querys/admin/adminUser.query";

export function useAdminUsers(params: AdminUserSearchRequest) {
  return useQuery(adminUsersListQuery(params));
}

export function useAdminUserDetail(userId: AdminUserId | null) {
  return useQuery({
    ...adminUserDetailQuery((userId ?? 0) as AdminUserId),
    enabled: !!userId && userId > 0,
  });
}

export function useAdminUserStatusUpdate() {
  return useMutation(adminUserStatusMutation());
}
