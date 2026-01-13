import { useQuery } from '@tanstack/react-query';
// 🔽 fetchAdminAccountDetail 대신 getAdminAccountDetail 사용
import { getAdminAccountDetail } from '@/apis/admin/account/adminAccount.api';
import { adminAccountKeys } from './adminAccountQueryKeys';
import type { AdminAccountDetailResponse } from '@/types/admin/response/account/adminAccountResponse';

/**
 * ✅ 2. 관리자 계정 상세 조회 (Detail)
 */
export const useAdminAccountDetailQuery = (userId: number | null) => {
  return useQuery<AdminAccountDetailResponse>({
    queryKey: adminAccountKeys.detail(userId as number),
    queryFn: () => getAdminAccountDetail(userId as number),
    // userId가 유효할 때만 쿼리 가동
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};