// src/hooks/queries/admin/useAdminMember.ts
import { useQuery } from '@tanstack/react-query';
import { adminMemberKeys } from './adminMemberQueryKeys';
import { getAdminMemberList } from '@/apis/admin/adminMember.api.ts'; 
import type { AdminMemberListRequest } from '@/apis/admin/request/member/adminMemberRequest';

export const useAdminMemberListQuery = (params: AdminMemberListRequest) => {
  return useQuery({
    queryKey: adminMemberKeys.list(params),
    queryFn: () => getAdminMemberList(params),
    placeholderData: (previousData) => previousData, 
  });
};