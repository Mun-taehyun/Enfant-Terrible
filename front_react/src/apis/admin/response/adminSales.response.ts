// src/apis/admin/response/adminSales.response.ts

import type { ApiResponse } from "@/types/admin/api";
import type { AdminSalesSummaryData } from "@/types/admin/sales";

/** GET /api/admin/sales */
export type GetAdminSalesSummaryResponse = ApiResponse<AdminSalesSummaryData>;
