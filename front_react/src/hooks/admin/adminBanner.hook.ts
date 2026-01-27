// src/hooks/admin/adminBanner.hook.ts

import type { AdminBannerId, AdminBannerListParams, AdminBannerSaveRequest } from "@/types/admin/banner";
import {
  useAdminBannerListQuery,
  useAdminBannerDetailQuery,
  useAdminBannerCreateMutation,
  useAdminBannerUpdateMutation,
  useAdminBannerDeleteMutation,
} from "@/querys/admin/adminBanner.query";

export function useAdminBanners(params: AdminBannerListParams) {
  return useAdminBannerListQuery(params);
}

export function useAdminBannerDetail(bannerId: AdminBannerId | null) {
  return useAdminBannerDetailQuery(bannerId);
}

export function useAdminBannerCreate() {
  return useAdminBannerCreateMutation();
}

export function useAdminBannerUpdate() {
  return useAdminBannerUpdateMutation();
}

export function useAdminBannerDelete() {
  return useAdminBannerDeleteMutation();
}

export type { AdminBannerListParams, AdminBannerSaveRequest };
