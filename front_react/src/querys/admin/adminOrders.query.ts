// src/querys/admin/adminOrders.query.ts
import type { AdminOrderListParams, AdminOrderListItem } from "@/types/admin/order";
import type { AdminPageResponse } from "@/types/admin/api";

import { getAdminOrders, getAdminOrderDetail } from "@/apis/admin/request/adminOrder.request";

export const adminOrdersKeys = {
  all: ["admin", "orders"] as const,
  list: (params: AdminOrderListParams) => ["admin", "orders", "list", params] as const,
  detail: (orderId: number) => ["admin", "orders", "detail", orderId] as const,
};

export function adminOrdersListQuery(params: AdminOrderListParams) {
  return {
    queryKey: adminOrdersKeys.list(params),
    queryFn: () => getAdminOrders(params),
    staleTime: 0,

    // React Query v5: keepPreviousData 대체
    // any 없이: 동일 타입을 그대로 반환
    placeholderData: (
      prev: AdminPageResponse<AdminOrderListItem> | undefined
    ): AdminPageResponse<AdminOrderListItem> | undefined => prev,
  };
}

export function adminOrderDetailQuery(orderId: number) {
  return {
    queryKey: adminOrdersKeys.detail(orderId),
    queryFn: () => getAdminOrderDetail(orderId),
    staleTime: 0,
  };
}
