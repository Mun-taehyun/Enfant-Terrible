// src/types/admin/member/useOrderQuery.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderList, updateOrderStatus } from '@/apis/admin/adminorder.api';
// 타입 임포트 추가
import type { GetAdminOrderListRequest } from '@/apis/admin/request/order/GetAdminOrderListRequest';

export const useOrderQuery = {
  // 주문 목록 조회
  // params: Request를 GetAdminOrderListRequest로 변경하세요
  useGetOrderList: (params: GetAdminOrderListRequest) => {
    return useQuery({
      queryKey: ['admin', 'orders', params],
      queryFn: () => getOrderList(params),
    });
  },

  // 배송 상태 등 업데이트
  useUpdateStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ orderId, status }: { orderId: number; status: string }) => 
        updateOrderStatus(orderId, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      },
    });
  },
};