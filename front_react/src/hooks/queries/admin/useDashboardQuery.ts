// src/hooks/queries/admin/useDashboardQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/apis/admin/adminDashboard.api';

export const useDashboardQuery = {
  useGetSummary: () => {
    return useQuery({
      queryKey: ['admin', 'dashboard', 'summary'],
      // API 파일에서 getDashboardStats로 이름을 바꿨으므로 이제 정상 작동합니다.
      queryFn: () => getDashboardStats(), 
      refetchInterval: 1000 * 60 * 5,
    });
  },
};