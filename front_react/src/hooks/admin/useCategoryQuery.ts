// src/hooks/admin/useCategoryQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getCategoryList } from '@/apis/admin/adminCategory.api'; 
import type { CategoryListRequest } from '@/apis/admin/request/category/CategoryListRequest'; // 여기 끝을 깔끔하게 정리

export const useCategoryQuery = {
  useGetCategoryList: (params: CategoryListRequest) => {
    return useQuery({
      queryKey: ['admin', 'categories', params],
      queryFn: () => getCategoryList(params),
      staleTime: 1000 * 60 * 60,
    });
  },
};