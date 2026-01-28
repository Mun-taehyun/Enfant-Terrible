// src/hooks/admin/adminSales.hook.ts

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { adminSalesSummaryQueryOptions } from "@/querys/admin/adminSales.query";
import type { AdminSalesGroupBy, AdminSalesRange, AdminSalesSummaryParams } from "@/types/admin/sales";

/**
 * 화면(YYYY-MM-DD) -> 백엔드(LocalDateTime) 변환
 * - paidFrom: 00:00:00
 * - paidTo  : 23:59:59
 */
function toPaidFromTo(range: AdminSalesRange): Pick<AdminSalesSummaryParams, "paidFrom" | "paidTo"> {
  const paidFrom = `${range.from}T00:00:00`;
  const paidTo = `${range.to}T23:59:59`;
  return { paidFrom, paidTo };
}

export function useAdminSalesSummary(range: AdminSalesRange, groupBy: AdminSalesGroupBy = "DAY") {
  // React Compiler 경고 방지: range 객체를 직접 의존성으로 둠
  const params = useMemo<AdminSalesSummaryParams>(() => {
    const { paidFrom, paidTo } = toPaidFromTo(range);
    return { paidFrom, paidTo, groupBy };
  }, [range, groupBy]);

  return useQuery(adminSalesSummaryQueryOptions(params));
}
