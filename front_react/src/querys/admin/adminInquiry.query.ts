// src/query/admin/adminInquiry.query.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminPageResponse } from "@/types/admin/api";
import type {
  AdminProductInquiryAnswerRequest,
  AdminProductInquiryListItem,
  AdminProductInquiryListParams,
} from "@/types/admin/inquiry";
import {
  deleteAdminProductInquiry,
  deleteAdminProductInquiryAnswer,
  getAdminProductInquiries,
  putAdminProductInquiryAnswer,
} from "@/apis/admin/request/adminInquiry.request";

const keys = {
  all: ["admin", "productInquiries"] as const,
  list: (params: AdminProductInquiryListParams) =>
    [...keys.all, "list", params] as const,
};

export function useAdminProductInquiries(params: AdminProductInquiryListParams) {
  return useQuery<AdminPageResponse<AdminProductInquiryListItem>, Error>({
    queryKey: keys.list(params),
    queryFn: () => getAdminProductInquiries(params),
    staleTime: 10_000,
  });
}

export function useAdminProductInquiryAnswerUpsert() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { inquiryId: number; body: AdminProductInquiryAnswerRequest }
  >({
    mutationFn: ({ inquiryId, body }) =>
      putAdminProductInquiryAnswer(inquiryId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useAdminProductInquiryAnswerClear() {
  const qc = useQueryClient();
  return useMutation<void, Error, { inquiryId: number }>({
    mutationFn: ({ inquiryId }) => deleteAdminProductInquiryAnswer(inquiryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useAdminProductInquiryDelete() {
  const qc = useQueryClient();
  return useMutation<void, Error, { inquiryId: number }>({
    mutationFn: ({ inquiryId }) => deleteAdminProductInquiry(inquiryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
