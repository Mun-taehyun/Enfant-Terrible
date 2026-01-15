// src/querys/admin/adminUser.query.ts
import type {
  AdminUserId,
  AdminUserSearchRequest,
  AdminUserStatusUpdateRequest,
} from '@/types/admin/user';

import {
  requestAdminUsers,
  requestAdminUserDetail,
  requestUpdateAdminUserStatus,
} from '@/apis/admin/request/adminUser.request';

export const adminUserKeys = {
  all: ['adminUsers'] as const,
  list: (params: AdminUserSearchRequest) => ['adminUsers', 'list', params] as const,
  detail: (userId: AdminUserId) => ['adminUsers', 'detail', userId] as const,
};

export const adminUsersListQuery = (params: AdminUserSearchRequest) => ({
  queryKey: adminUserKeys.list(params),
  queryFn: () => requestAdminUsers(params),
});

export const adminUserDetailQuery = (userId: AdminUserId) => ({
  queryKey: adminUserKeys.detail(userId),
  queryFn: () => requestAdminUserDetail(userId),

  enabled: Number.isFinite(userId as unknown as number),
});

export const adminUserStatusMutation = () => ({
  mutationFn: (v: { userId: AdminUserId; body: AdminUserStatusUpdateRequest }) =>
    requestUpdateAdminUserStatus(v.userId, v.body),
});
