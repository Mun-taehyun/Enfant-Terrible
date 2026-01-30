// src/apis/admin/request/adminPoint.request.ts
import { mainAxios } from "@/apis/admin/main_axios";

import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type {
  AdminPointAdjustRequest,
  AdminPointBalanceResponse,
  AdminPointHistoryItem,
  AdminPointHistoryParams,
} from "@/types/admin/point";

function unwrapOrThrow<T>(res: ApiResponse<T>): T {
  if (!res || res.success !== true) {
    throw new Error(res?.message || "요청에 실패했습니다.");
  }
  return res.data;
}

/**
 * Spring(AdminPointController) 기준:
 * - GET  /api/admin/points/users/{userId}/balance
 * - GET  /api/admin/points/users/{userId}/history?page&size&sortBy&direction
 * - POST /api/admin/points/users/{userId}/adjust
 */

export async function getAdminPointBalance(userId: number): Promise<AdminPointBalanceResponse> {
  const { data } = await mainAxios.get<ApiResponse<AdminPointBalanceResponse>>(
    `/admin/points/users/${userId}/balance`
  );
  return unwrapOrThrow(data);
}

export async function getAdminPointHistory(
  userId: number,
  params: AdminPointHistoryParams
): Promise<AdminPageResponse<AdminPointHistoryItem>> {
  const { data } = await mainAxios.get<ApiResponse<AdminPageResponse<AdminPointHistoryItem>>>(
    `/admin/points/users/${userId}/history`,
    { params }
  );
  return unwrapOrThrow(data);
}

export async function postAdminPointAdjust(
  userId: number,
  body: AdminPointAdjustRequest
): Promise<null> {
  const { data } = await mainAxios.post<ApiResponse<null>>(
    `/admin/points/users/${userId}/adjust`,
    body
  );
  return unwrapOrThrow(data);
}
