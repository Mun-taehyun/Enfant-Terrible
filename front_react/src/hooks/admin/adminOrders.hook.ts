// src/hooks/admin/adminOrders.hook.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AdminOrderListParams,
  AdminOrderCancelPayload,
  AdminOrderStatusUpdatePayload,
  AdminOrderShippingStartPayload,
} from "@/types/admin/order";

import { adminOrdersListQuery, adminOrdersKeys } from "@/querys/admin/adminOrders.query";

import {
  getAdminOrderDetail,
  patchAdminOrderStatus,
  patchAdminOrderShipping,
  postAdminOrderCancelItems,
} from "@/apis/admin/request/adminOrder.request";

export function useAdminOrders(params: AdminOrderListParams) {
  return useQuery(adminOrdersListQuery(params));
}

export function useAdminOrderDetail(orderId: number | null) {
  return useQuery({
    queryKey:
      orderId != null
        ? adminOrdersKeys.detail(orderId)
        : (["admin", "orders", "detail", "disabled"] as const),

    queryFn: async () => {
      if (orderId == null) {
        throw new Error("orderId is required");
      }
      return getAdminOrderDetail(orderId);
    },

    enabled: orderId != null,
    staleTime: 0,
  });
}

export function useAdminOrderStatusUpdate() {
  const qc = useQueryClient();

  return useMutation<void, Error, { orderId: number; body: AdminOrderStatusUpdatePayload }>({
    mutationFn: (vars) => patchAdminOrderStatus(vars.orderId, vars.body),

    onSuccess: async (_res, vars) => {
      await qc.invalidateQueries({ queryKey: adminOrdersKeys.all });
      await qc.invalidateQueries({ queryKey: adminOrdersKeys.detail(vars.orderId) });
    },
  });
}

export function useAdminOrderShippingStart() {
  const qc = useQueryClient();

  return useMutation<void, Error, { orderId: number; body: AdminOrderShippingStartPayload }>({
    mutationFn: (vars) => patchAdminOrderShipping(vars.orderId, vars.body),

    onSuccess: async (_res, vars) => {
      await qc.invalidateQueries({ queryKey: adminOrdersKeys.all });
      await qc.invalidateQueries({ queryKey: adminOrdersKeys.detail(vars.orderId) });
    },
  });
}

export function useAdminOrderCancelItems() {
  const qc = useQueryClient();

  return useMutation<void, Error, { orderId: number; body: AdminOrderCancelPayload }>({
    mutationFn: (vars) => postAdminOrderCancelItems(vars.orderId, vars.body),

    onSuccess: async (_res, vars) => {
      await qc.invalidateQueries({ queryKey: adminOrdersKeys.all });
      await qc.invalidateQueries({ queryKey: adminOrdersKeys.detail(vars.orderId) });
    },
  });
}
