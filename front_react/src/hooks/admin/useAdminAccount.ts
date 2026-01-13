import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAccountKeys } from './adminAccountQueryKeys';
import { 
  getAdminAccountList, 
  getAdminAccountDetail, 
  patchAdminAccountStatus 
} from '@/apis/admin/account/adminAccount.api'; 
import type { AdminAccountListRequest } from '@/types/admin/request/account/adminAccountRequest';
import type { MemberStatus } from '@/components/common/codes';

export const useAdminAccountListQuery = (params: AdminAccountListRequest) => {
  return useQuery({
    queryKey: adminAccountKeys.list(params),
    queryFn: () => getAdminAccountList(params),
  });
};

// ✅ 상세 조회 훅 추가
export const useAdminAccountDetailQuery = (userId: number) => {
  return useQuery({
    queryKey: adminAccountKeys.detail(userId),
    queryFn: () => getAdminAccountDetail(userId),
    enabled: !!userId,
  });
};

export const useAdminAccountStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: MemberStatus }) =>
      patchAdminAccountStatus(userId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminAccountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminAccountKeys.detail(variables.userId) });
      alert('변경 완료');
    },
  });
};