// src/hooks/admin/adminInquiry.hook.ts
import type { AdminProductInquiryListParams } from "@/types/admin/inquiry";
import {
  useAdminProductInquiries,
  useAdminProductInquiryAnswerUpsert,
  useAdminProductInquiryAnswerClear,
  useAdminProductInquiryDelete,
} from "@/querys/admin/adminInquiry.query";

export function useAdminInquiries(params: AdminProductInquiryListParams) {
  return useAdminProductInquiries(params);
}

export function useAdminInquiryAnswerUpsert() {
  return useAdminProductInquiryAnswerUpsert();
}

export function useAdminInquiryAnswerClear() {
  return useAdminProductInquiryAnswerClear();
}

export function useAdminInquiryDelete() {
  return useAdminProductInquiryDelete();
}
