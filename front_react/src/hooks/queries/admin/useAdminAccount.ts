import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAccountKeys } from './adminAccountQueryKeys';
// 🔽 API 파일에 선언된 실제 이름인 'get'으로 매칭
import { 
  getAdminAccountList, 
  patchAdminAccountStatus 
} from '@/apis/admin/account/adminAccount.api'; 

import type { AdminAccountListRequest } from '@/types/admin/request/account/adminAccountRequest';
import type { MemberStatus } from '@/components/common/codes';

/**
 * ✅ 1. 관리자 계정 목록 조회 (List)
 */
export const useAdminAccountListQuery = (params: AdminAccountListRequest) => {
  return useQuery({
    queryKey: adminAccountKeys.list(params),
    queryFn: () => getAdminAccountList(params),
    placeholderData: (previousData) => previousData, 
  });
};

/**
 * ✅ 3. 계정 상태 변경 (Mutation)
 */
export const useAdminAccountStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: MemberStatus }) =>
      patchAdminAccountStatus(userId, status),
    onSuccess: (_, variables) => {
      // 목록 무효화
      queryClient.invalidateQueries({ queryKey: adminAccountKeys.lists() });
      // 상세 정보 무효화 (상세 조회가 띄워져 있을 경우 대비)
      queryClient.invalidateQueries({ queryKey: adminAccountKeys.detail(variables.userId) });
      
      alert('상태 변경이 완료되었습니다.');
    },
    onError: (error: Error) => {
      alert(`에러 발생: ${error.message}`);
    }
  });
};