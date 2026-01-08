import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
// 정밀경로 활용 
import { 
  getAdminAccountList, 
  getAdminAccountDetail, 
  patchAdminAccountStatus 
} from '../../../apis/admin/account/adminAccount.api';
import type { AdminAccountListRequest } from '../../../types/admin/request/account/adminAccountRequest';
import type { MemberStatus } from '../../../components/common/codes';

/**
 * @description 6. 계정 목록 조회 훅 (페이징/검색 포함)
 */
export const useAdminAccountListQuery = (params: AdminAccountListRequest) => {
  return useQuery({
    queryKey: ['adminAccountList', params],
    queryFn: () => getAdminAccountList(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * @description 7. 계정 상세 조회 훅
 */
export const useAdminAccountDetailQuery = (userId: number) => {
  return useQuery({
    queryKey: ['adminAccountDetail', userId],
    queryFn: () => getAdminAccountDetail(userId),
    enabled: !!userId, // ID가 있을 때만 자동 실행
  });
};

/**
 * @description 8. 계정 상태 변경 훅
 */
export const useAdminAccountStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: MemberStatus }) =>
      patchAdminAccountStatus(userId, status),
    onSuccess: () => {
      // 목록 캐시 무효화 (화면 자동 새로고침의 핵심)
      queryClient.invalidateQueries({ queryKey: ['adminAccountList'] });
      alert('계정 상태가 성공적으로 변경되었습니다.');
    },
    onError: (error) => {
      console.error('상태 변경 실패:', error);
      alert('변경에 실패했습니다. 다시 시도해 주세요.');
    }
  });
};