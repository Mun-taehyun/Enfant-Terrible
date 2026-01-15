// src/query/admin/adminSales.query.ts
import type { AdminSalesRange } from "@/types/admin/sales";
import { getAdminAmount, getAdminAmountDaily } from "@/apis/admin/request/adminSales.request";

export const adminSalesKeys = {
  all: ["admin", "sales"] as const,
  amount: (range: AdminSalesRange) => [...adminSalesKeys.all, "amount", range.from, range.to] as const,
  daily: (range: AdminSalesRange) => [...adminSalesKeys.all, "daily", range.from, range.to] as const,
};

export function adminAmountQueryOptions(range: AdminSalesRange) {
  return {
    queryKey: adminSalesKeys.amount(range),
    queryFn: () => getAdminAmount(range),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  };
}

export function adminAmountDailyQueryOptions(range: AdminSalesRange) {
  return {
    queryKey: adminSalesKeys.daily(range),
    queryFn: () => getAdminAmountDaily(range),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  };
}
