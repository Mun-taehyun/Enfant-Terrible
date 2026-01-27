// src/apis/admin/response/login.response.ts
import type { ApiResponse } from "@/types/admin/api";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isApiResponse(v: unknown): v is ApiResponse<unknown> {
  if (!isObject(v)) return false;

  // success: boolean 필수
  if (typeof v.success !== "boolean") return false;

  // message: (있다면) string
  if ("message" in v && v.message != null && typeof v.message !== "string") return false;

  // data: 키 존재 여부만 확인(타입은 제네릭으로 처리)
  if (!("data" in v)) return false;

  return true;
}

export const unwrapOrThrow = <T>(res: unknown): T => {
  if (!isApiResponse(res)) {
    throw new Error("응답 형식이 올바르지 않습니다.");
  }

  if (res.success !== true) {
    throw new Error(res.message || "요청에 실패했습니다.");
  }

  // 여기서 res는 ApiResponse<unknown>임이 보장됨
  return res.data as T;
};
