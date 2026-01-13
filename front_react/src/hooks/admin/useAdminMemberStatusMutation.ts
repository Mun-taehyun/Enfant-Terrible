import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminMemberKeys } from './adminMemberQueryKeys';
import { patchAdminMemberStatus } from '@/apis/admin/request/member/adminMember.api.ts';
import type { MemberStatus } from '@/components/common/codes';

/**
 * ✅ 관리자 회원 상태 변경 Mutation 훅
 */
export const useAdminMemberStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: MemberStatus }) =>
      patchAdminMemberStatus(userId, status),
    
    onSuccess: (_, variables) => {
      // ✅ Member 관련 모든 목록 쿼리 무효화 (자동 새로고침)
      queryClient.invalidateQueries({ 
        queryKey: adminMemberKeys.lists() 
      });
      
      // 해당 회원의 상세 정보도 무효화
      queryClient.invalidateQueries({ 
        queryKey: adminMemberKeys.detail(variables.userId) 
      });
      
      alert('회원 상태가 성공적으로 변경되었습니다. ㅋ');
    },
    onError: (error: Error) => {
      alert(`상태 변경 실패: ${error.message}`);
    }
  });
};