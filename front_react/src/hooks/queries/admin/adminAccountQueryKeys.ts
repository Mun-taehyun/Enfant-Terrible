// src/hooks/queries/admin/adminAccountQueryKeys.ts

// 1. 타입을 가져옵니다. (경로 확인!)
import type { AdminAccountListRequest } from '@/types/admin/request/account/adminAccountRequest';

export const adminAccountKeys = {
  all: ['adminAccount'] as const,
  
  // 전체 목록 키
  lists: () => [...adminAccountKeys.all, 'list'] as const,
  
  // 2. any 대신 AdminAccountListRequest 적용
  list: (params: AdminAccountListRequest) => [...adminAccountKeys.lists(), params] as const,
  
  // 상세 정보 키
  details: () => [...adminAccountKeys.all, 'detail'] as const,
  
  detail: (userId: number) => [...adminAccountKeys.details(), userId] as const,
};