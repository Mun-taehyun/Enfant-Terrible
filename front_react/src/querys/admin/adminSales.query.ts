// src/query/admin/adminSales.query.ts

import type { QueryKey } from "@tanstack/react-query";
import { getAdminSalesSummary } from "@/apis/admin/request/adminSales.request";
import type { AdminSalesSummaryParams } from "@/types/admin/sales";

export function adminSalesSummaryQueryKey(params: AdminSalesSummaryParams): QueryKey {
  // 객체 통째로 넣지 말고 원시값으로 고정 (캐시/리렌더 안정)
  return ["adminSalesSummary", params.paidFrom, params.paidTo, params.groupBy ?? "DAY"];
}

export function adminSalesSummaryQueryOptions(params: AdminSalesSummaryParams) {
  return {
    queryKey: adminSalesSummaryQueryKey(params),
    queryFn: () => getAdminSalesSummary(params),
  } as const;
}
