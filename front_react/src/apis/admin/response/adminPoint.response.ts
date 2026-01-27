// src/apis/admin/response/adminPoint.response.ts
import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type {
  AdminPointBalanceResponse,
  AdminPointHistoryItem,
} from "@/types/admin/point";

export type GetAdminPointBalanceResponse = ApiResponse<AdminPointBalanceResponse>;
export type GetAdminPointHistoryResponse = ApiResponse<AdminPageResponse<AdminPointHistoryItem>>;
export type PostAdminPointAdjustResponse = ApiResponse<null>;
