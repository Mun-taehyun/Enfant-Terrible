// src/hooks/admin/member/useAdminMemberQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminMemberList,
  getAdminMemberDetail,
  patchAdminMemberStatus,
} from '@/apis/admin/member/adminMember.api';
import { AdminMemberListResponse, MemberStatus } from '@/types/admin/member/member';

/**
 * 관리자 회원 목록 조회
 */
export const useAdminMemberListQuery = (page: number, size = 20) => {
  return useQuery({
    queryKey: ['adminMembers', page],
    queryFn: async () => {
      const res = await getAdminMemberList({ page, size });
      return res.data as AdminMemberListResponse;
    },
    keepPreviousData: true,
  });
};

/**
 * 관리자 회원 상세 조회
 */
export const useAdminMemberDetailQuery = (memberId: number) => {
  return useQuery({
    queryKey: ['adminMember', memberId],
    queryFn: async () => {
      const res = await getAdminMemberDetail(memberId);
      return res.data;
    },
    enabled: !!memberId,
  });
};

/**
 * 관리자 회원 상태 변경
 */
export const useAdminMemberStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      status,
    }: {
      memberId: number;
      status: MemberStatus;
    }) => patchAdminMemberStatus(memberId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
    },
  });
};