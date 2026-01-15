// src/apis/admin/response/adminSales.response.ts
import type { ApiResponse } from "@/types/admin/api";
import type { AdminAmountDailyItem, AdminAmountSummary } from "@/types/admin/sales";

export type GetAdminAmountResponse = ApiResponse<AdminAmountSummary>;
export type GetAdminAmountDailyResponse = ApiResponse<AdminAmountDailyItem[]>;
