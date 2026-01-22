// src/apis/admin/request/adminInquiry.request.ts
import { mainAxios } from "@/apis/admin/main_axios";
import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type {
  AdminProductInquiryAnswerRequest,
  AdminProductInquiryListItem,
  AdminProductInquiryListParams,
} from "@/types/admin/inquiry";

function unwrapOrThrow<T>(res: ApiResponse<T>): T {
  if (!res || res.success !== true) {
    throw new Error(res?.message || "요청에 실패했습니다.");
  }
  return res.data;
}

/**
 * 백엔드 스펙 그대로:
 * - GET    /api/admin/product-inquiries
 * - PUT    /api/admin/product-inquiries/{inquiryId}/answer
 * - DELETE /api/admin/product-inquiries/{inquiryId}/answer
 * - DELETE /api/admin/product-inquiries/{inquiryId}
 */

export async function getAdminProductInquiries(
  params: AdminProductInquiryListParams
): Promise<AdminPageResponse<AdminProductInquiryListItem>> {
  const res = await mainAxios.get<
    ApiResponse<AdminPageResponse<AdminProductInquiryListItem>>
  >("/api/admin/product-inquiries", { params });
  return unwrapOrThrow(res.data);
}

export async function putAdminProductInquiryAnswer(
  inquiryId: number,
  body: AdminProductInquiryAnswerRequest
): Promise<void> {
  const res = await mainAxios.put<ApiResponse<null>>(
    `/api/admin/product-inquiries/${inquiryId}/answer`,
    body
  );
  unwrapOrThrow(res.data);
}

export async function deleteAdminProductInquiryAnswer(
  inquiryId: number
): Promise<void> {
  const res = await mainAxios.delete<ApiResponse<null>>(
    `/api/admin/product-inquiries/${inquiryId}/answer`
  );
  unwrapOrThrow(res.data);
}

export async function deleteAdminProductInquiry(
  inquiryId: number
): Promise<void> {
  const res = await mainAxios.delete<ApiResponse<null>>(
    `/api/admin/product-inquiries/${inquiryId}`
  );
  unwrapOrThrow(res.data);
}
