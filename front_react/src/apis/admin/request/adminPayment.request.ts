// src/apis/admin/request/adminPayment.request.ts
import { mainAxios } from "@/apis/admin/main_axios";
import type { AdminPaymentCancelBody, AdminPaymentListParams } from "@/types/admin/payment";
import type {
  GetAdminPaymentsResponse,
  GetAdminPaymentDetailResponse,
  PostAdminPaymentCancelResponse,
} from "@/apis/admin/response/adminPayment.response";

export async function getAdminPayments(params: AdminPaymentListParams) {
  const { data } = await mainAxios.get<GetAdminPaymentsResponse>("/admin/payments", { params });
  return data;
}

export async function getAdminPaymentDetail(paymentId: number) {
  const { data } = await mainAxios.get<GetAdminPaymentDetailResponse>(`/admin/payments/${paymentId}`);
  return data;
}

export async function postAdminPaymentCancel(paymentId: number, body: AdminPaymentCancelBody) {
  const { data } = await mainAxios.post<PostAdminPaymentCancelResponse>(`/admin/payments/${paymentId}/cancel`, body);
  return data;
}
