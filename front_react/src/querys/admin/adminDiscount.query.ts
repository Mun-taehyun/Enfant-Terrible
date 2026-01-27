// src/querys/admin/adminDiscount.query.ts
import type { QueryKey } from "@tanstack/react-query";
import { getAdminProductDiscounts } from "@/apis/admin/request/adminDiscount.request";

export const adminDiscountKeys = {
  root: ["admin", "product-discounts"] as const,
  list: (productId: number) => [...adminDiscountKeys.root, "list", productId] as const,
};

export function adminProductDiscountsOptions(productId: number) {
  return {
    queryKey: adminDiscountKeys.list(productId) as QueryKey,
    queryFn: () => getAdminProductDiscounts(productId),
    enabled: productId > 0,
  };
}
