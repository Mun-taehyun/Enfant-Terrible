import type { AdminAccountListRequest } from '@/types/admin/request/account/adminAccountRequest';

export const adminAccountKeys = {
  all: ['adminAccounts'] as const,
  lists: () => [...adminAccountKeys.all, 'list'] as const,
  // ✅ any 대신 정확한 Request 타입을 사용합니다.
  list: (params: AdminAccountListRequest) => [...adminAccountKeys.lists(), params] as const,
  details: () => [...adminAccountKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminAccountKeys.details(), id] as const,
};

export const adminAccountQueryKeys = adminAccountKeys;