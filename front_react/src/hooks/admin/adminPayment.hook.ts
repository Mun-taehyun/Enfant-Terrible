// src/hooks/admin/adminPayment.hook.ts
import type { AdminPaymentListParams } from "@/types/admin/payment";
import {
  useAdminPaymentsQuery,
  useAdminPaymentDetailQuery,
  useAdminPaymentCancelMutation,
} from "@/querys/admin/adminPayment.query";

export function useAdminPayments(params: AdminPaymentListParams) {
  return useAdminPaymentsQuery(params);
}

export function useAdminPaymentDetail(paymentId: number | null) {
  return useAdminPaymentDetailQuery(paymentId);
}

export function useAdminPaymentCancel() {
  return useAdminPaymentCancelMutation();
}
