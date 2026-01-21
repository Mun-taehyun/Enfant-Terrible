// src/apis/admin/response/adminPayment.response.ts
import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type { AdminPaymentDetail, AdminPaymentListItem } from "@/types/admin/payment";

export type GetAdminPaymentsResponse = ApiResponse<AdminPageResponse<AdminPaymentListItem>>;
export type GetAdminPaymentDetailResponse = ApiResponse<AdminPaymentDetail>;
export type PostAdminPaymentCancelResponse = ApiResponse<null> | ApiResponse<void>;

// 공용 헬퍼를 프로젝트에 이미 쓰고 있더라도, 여기서는 유추 없이 파일 단독으로 완결되게 둡니다.
export function unwrapOrThrow<T>(res: ApiResponse<T>): T {
  if (!res || res.success !== true) {
    const msg = res?.message || "요청에 실패했습니다.";
    throw new Error(msg);
  }
  return res.data as T;
}
