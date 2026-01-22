// src/apis/admin/request/adminSales.request.ts

import { mainAxios } from "@/apis/admin/main_axios";
import type { AdminSalesSummaryParams } from "@/types/admin/sales";
import type { GetAdminSalesSummaryResponse } from "@/apis/admin/response/adminSales.response";

function unwrapOrThrow<T>(res: { success: boolean; data: T; message: string }): T {
  if (!res || res.success !== true) {
    throw new Error(res?.message || "요청에 실패했습니다.");
  }
  return res.data;
}

/**
 * 백엔드 스펙:
 * GET /api/admin/sales
 * Query: paidFrom, paidTo, groupBy(DAY|MONTH)
 */
export async function getAdminSalesSummary(params: AdminSalesSummaryParams) {
  const res = await mainAxios.get<GetAdminSalesSummaryResponse>("/api/admin/sales", { params });
  return unwrapOrThrow(res.data);
}
