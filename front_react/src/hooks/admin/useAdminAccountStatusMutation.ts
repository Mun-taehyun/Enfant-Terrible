import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchAdminAccountStatus } from '@/apis/admin/account/adminAccount.api';
import { adminAccountKeys } from './adminAccountQueryKeys';
import type { MemberStatus } from '@/components/common/codes';

// 1. Mutation에서 사용할 인자 타입을 명확히 정의 (any 박멸)
interface UpdateStatusParams {
  userId: number;
  status: MemberStatus;
}

/**
 * ✅ 관리자 계정 상태 변경 Mutation 훅
 */
export const useAdminAccountStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 2. any 대신 정의한 인터페이스 적용
    mutationFn: ({ userId, status }: UpdateStatusParams) =>
      patchAdminAccountStatus(userId, status),

    onSuccess: (_, variables) => {
      // 3. 목록 쿼리 전체 무효화
      queryClient.invalidateQueries({ 
        queryKey: adminAccountKeys.lists() 
      });

      // 4. 상세 쿼리도 있다면 해당 유저의 상세 정보도 함께 무효화
      queryClient.invalidateQueries({ 
        queryKey: adminAccountKeys.detail(variables.userId) 
      });
      
      alert('상태 변경이 완료되었습니다.');
    },

    // 5. 에러 객체에도 타입을 명시 (기본 Error 객체 활용)
    onError: (error: Error) => {
      console.error('상태 변경 실패:', error.message);
      alert(`변경 실패: ${error.message}`);
    }
  });
};