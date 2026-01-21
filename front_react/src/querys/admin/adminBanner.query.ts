// src/query/admin/adminBanner.query.ts

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { AdminPageResponse } from "@/types/admin/api";
import type {
  AdminBannerDetail,
  AdminBannerId,
  AdminBannerListItem,
  AdminBannerListParams,
  AdminBannerSaveRequest,
} from "@/types/admin/banner";

import {
  apiAdminBannerList,
  apiAdminBannerDetail,
  apiAdminBannerCreate,
  apiAdminBannerUpdate,
  apiAdminBannerDelete,
} from "@/apis/admin/request/adminBanner.request";

export const adminBannerKeys = {
  all: ["admin", "banners"] as const,
  list: (params: AdminBannerListParams) => [...adminBannerKeys.all, "list", params] as const,
  detail: (bannerId: AdminBannerId) => [...adminBannerKeys.all, "detail", bannerId] as const,
};

export function useAdminBannerListQuery(params: AdminBannerListParams) {
  return useQuery<AdminPageResponse<AdminBannerListItem>, Error>({
    queryKey: adminBannerKeys.list(params),
    queryFn: () => apiAdminBannerList(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminBannerDetailQuery(bannerId: AdminBannerId | null) {
  return useQuery<AdminBannerDetail, Error>({
    queryKey: bannerId ? adminBannerKeys.detail(bannerId) : ["admin", "banners", "detail", "none"],
    queryFn: () => apiAdminBannerDetail(bannerId as AdminBannerId),
    enabled: bannerId != null,
  });
}

export function useAdminBannerCreateMutation() {
  const qc = useQueryClient();
  return useMutation<number, Error, AdminBannerSaveRequest>({
    mutationFn: (body) => apiAdminBannerCreate(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminBannerKeys.all }),
  });
}

export function useAdminBannerUpdateMutation() {
  const qc = useQueryClient();
  return useMutation<null, Error, { bannerId: AdminBannerId; body: AdminBannerSaveRequest }>({
    mutationFn: (args) => apiAdminBannerUpdate(args.bannerId, args.body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: adminBannerKeys.all });
      qc.invalidateQueries({ queryKey: adminBannerKeys.detail(vars.bannerId) });
    },
  });
}

export function useAdminBannerDeleteMutation() {
  const qc = useQueryClient();
  return useMutation<null, Error, AdminBannerId>({
    mutationFn: (bannerId) => apiAdminBannerDelete(bannerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminBannerKeys.all }),
  });
}
