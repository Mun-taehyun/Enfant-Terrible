// src/hooks/admin/adminSales.query.ts
import { useQuery } from "@tanstack/react-query";
import type { AdminSalesRange } from "@/types/admin/sales";
import { adminAmountDailyQueryOptions, adminAmountQueryOptions } from "@/querys/admin/adminSales.query";

export function useAdminAmount(range: AdminSalesRange) {
  return useQuery(adminAmountQueryOptions(range));
}

export function useAdminAmountDaily(range: AdminSalesRange) {
  return useQuery(adminAmountDailyQueryOptions(range));
}
