// 파일: src/hooks/admin/adminUsers.query.ts


// 사용자 검색
import type { AdminUserSearchRequest } from "@/types/admin/user";
import { useAdminUsersQuery } from "@/querys/admin/adminUser.query.ts";

export function useAdminUsers(params: AdminUserSearchRequest) {
  return useAdminUsersQuery(params);
}


// 사용자 상세 조회
import type { AdminUserId } from "@/types/admin/user";
import { useAdminUserDetailQuery } from "@/querys/admin/adminUser.query.ts";

export function useAdminUserDetail(userId: AdminUserId) {
  return useAdminUserDetailQuery(userId);
}


// 사용자 상태 변경
import { useAdminUserStatusMutation } from "@/querys/admin/adminUser.query.ts";

export function useAdminUserStatusUpdate() {
  return useAdminUserStatusMutation();
}