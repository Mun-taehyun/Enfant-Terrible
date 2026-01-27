// src/query/admin/adminPayment.query.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AdminPaymentCancelBody, AdminPaymentListParams } from "@/types/admin/payment";
import {
  getAdminPaymentDetail,
  getAdminPayments,
  postAdminPaymentCancel,
} from "@/apis/admin/request/adminPayment.request";
import { unwrapOrThrow } from "@/apis/admin/response/adminPayment.response";

export const adminPaymentKeys = {
  all: ["admin", "payments"] as const,
  list: (params: AdminPaymentListParams) => [...adminPaymentKeys.all, "list", params] as const,
  detail: (paymentId: number) => [...adminPaymentKeys.all, "detail", paymentId] as const,
};

export function useAdminPaymentsQuery(params: AdminPaymentListParams) {
  return useQuery({
    queryKey: adminPaymentKeys.list(params),
    queryFn: async () => unwrapOrThrow(await getAdminPayments(params)),
    // ✅ v5: keepPreviousData 대신 placeholderData로 "이전 데이터 유지"
    placeholderData: (prev) => prev,
  });
}

export function useAdminPaymentDetailQuery(paymentId: number | null) {
  return useQuery({
    queryKey: paymentId ? adminPaymentKeys.detail(paymentId) : ["admin", "payments", "detail", "null"],
    queryFn: async () => {
      if (paymentId == null) throw new Error("paymentId가 없습니다.");
      return unwrapOrThrow(await getAdminPaymentDetail(paymentId));
    },
    enabled: paymentId != null,
  });
}

export function useAdminPaymentCancelMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { paymentId: number; body: AdminPaymentCancelBody }) => {
      return unwrapOrThrow(await postAdminPaymentCancel(vars.paymentId, vars.body));
    },
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: adminPaymentKeys.all });
      await qc.invalidateQueries({ queryKey: adminPaymentKeys.detail(vars.paymentId) });
    },
  });
}
