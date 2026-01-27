// src/query/admin/adminPopup.query.ts

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { AdminPageResponse } from "@/types/admin/api";
import type {
  AdminPopupDetail,
  AdminPopupId,
  AdminPopupListItem,
  AdminPopupListParams,
  AdminPopupSaveRequest,
} from "@/types/admin/popup";

import {
  apiAdminPopupCreate,
  apiAdminPopupDelete,
  apiAdminPopupDetail,
  apiAdminPopupList,
  apiAdminPopupUpdate,
} from "@/apis/admin/request/adminPopup.request";

export const adminPopupKeys = {
  all: ["admin", "popups"] as const,
  list: (params: AdminPopupListParams) =>
    [...adminPopupKeys.all, "list", params] as const,
  detail: (popupId: AdminPopupId) =>
    [...adminPopupKeys.all, "detail", popupId] as const,
};

export function useAdminPopupListQuery(params: AdminPopupListParams) {
  return useQuery<AdminPageResponse<AdminPopupListItem>, Error>({
    queryKey: adminPopupKeys.list(params),
    queryFn: () => apiAdminPopupList(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminPopupDetailQuery(popupId: AdminPopupId | null) {
  return useQuery<AdminPopupDetail, Error>({
    queryKey: popupId
      ? adminPopupKeys.detail(popupId)
      : ["admin", "popups", "detail", "none"],
    queryFn: () => apiAdminPopupDetail(popupId as AdminPopupId),
    enabled: popupId != null,
  });
}

export function useAdminPopupCreateMutation() {
  const qc = useQueryClient();
  return useMutation<number, Error, AdminPopupSaveRequest>({
    mutationFn: (body) => apiAdminPopupCreate(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminPopupKeys.all }),
  });
}

export function useAdminPopupUpdateMutation() {
  const qc = useQueryClient();
  return useMutation<null, Error, { popupId: AdminPopupId; body: AdminPopupSaveRequest }>({
    mutationFn: (args) => apiAdminPopupUpdate(args.popupId, args.body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: adminPopupKeys.all });
      qc.invalidateQueries({ queryKey: adminPopupKeys.detail(vars.popupId) });
    },
  });
}

export function useAdminPopupDeleteMutation() {
  const qc = useQueryClient();
  return useMutation<null, Error, AdminPopupId>({
    mutationFn: (popupId) => apiAdminPopupDelete(popupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminPopupKeys.all }),
  });
}
