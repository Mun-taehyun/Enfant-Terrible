// src/hooks/queries/admin/adminMemberQueryKeys.ts
import type { AdminMemberListRequest } from '@/apis/admin/request/member/adminMemberRequest';

export const adminMemberKeys = {
  all: ['adminMember'] as const,
  lists: () => [...adminMemberKeys.all, 'list'] as const,
  list: (params: AdminMemberListRequest) => [...adminMemberKeys.lists(), params] as const,
  details: () => [...adminMemberKeys.all, 'detail'] as const,
  detail: (userId: number) => [...adminMemberKeys.details(), userId] as const,
};