// src/apis/admin/request/adminSales.request.ts
import { mainAxios } from "@/apis/admin/main_axios";
import type { AdminSalesRange, AdminAmountDailyItem } from "@/types/admin/sales";
import type {
  GetAdminAmountDailyResponse,
  GetAdminAmountResponse,
} from "../response/adminSales.response";
import type { ApiResponse } from "@/types/admin/api";

function unwrapOrThrow<T>(res: ApiResponse<T>): T {
  if (!res?.success) throw new Error(res?.message || "요청에 실패했습니다.");
  return res.data;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function normalizeDaily(payload: unknown): AdminAmountDailyItem[] {
  // 1) 이미 배열이면 그대로
  if (Array.isArray(payload)) return payload as AdminAmountDailyItem[];

  // 2) 객체라면 흔한 키들에서 배열을 찾아서 반환
  const obj = asRecord(payload);
  if (obj) {
    const keys = ["content", "items", "list", "daily", "data"] as const;
    for (const k of keys) {
      const candidate = obj[k];
      if (Array.isArray(candidate)) return candidate as AdminAmountDailyItem[];
    }
  }

  // 3) 그 외는 빈 배열
  return [];
}

/** 기간 합계 */
export async function getAdminAmount(range: AdminSalesRange) {
  const { data } = await mainAxios.get<GetAdminAmountResponse>("/admin/amount", {
    params: range,
  });
  return unwrapOrThrow(data);
}

/** 일별 합계 */
export async function getAdminAmountDaily(range: AdminSalesRange) {
  const { data } = await mainAxios.get<GetAdminAmountDailyResponse>("/admin/amount/daily", {
    params: range,
  });

  const payload = unwrapOrThrow(data); // payload가 배열/객체일 수 있음
  return normalizeDaily(payload);
}
