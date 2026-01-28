// src/hooks/admin/adminDiscount.hook.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AdminProductDiscountSavePayload } from "@/types/admin/discount";
import { adminDiscountKeys, adminProductDiscountsOptions } from "@/querys/admin/adminDiscount.query";
import {
  createAdminProductDiscount,
  updateAdminProductDiscount,
  deleteAdminProductDiscount,
} from "@/apis/admin/request/adminDiscount.request";

export function useAdminProductDiscounts(productId: number) {
  return useQuery(adminProductDiscountsOptions(productId));
}

export function useAdminProductDiscountCreate(productIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminProductDiscountSavePayload) => createAdminProductDiscount(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminDiscountKeys.list(productIdForInvalidate) });
    },
  });
}

export function useAdminProductDiscountUpdate(productIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { discountId: number; payload: AdminProductDiscountSavePayload }) =>
      updateAdminProductDiscount(vars.discountId, vars.payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminDiscountKeys.list(productIdForInvalidate) });
    },
  });
}

export function useAdminProductDiscountDelete(productIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (discountId: number) => deleteAdminProductDiscount(discountId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminDiscountKeys.list(productIdForInvalidate) });
    },
  });
}
