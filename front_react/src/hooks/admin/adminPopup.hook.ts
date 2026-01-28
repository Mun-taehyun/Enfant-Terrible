// src/hooks/admin/adminPopup.hook.ts

import type { AdminPopupId, AdminPopupListParams, AdminPopupSaveRequest } from "@/types/admin/popup";
import {
  useAdminPopupListQuery,
  useAdminPopupDetailQuery,
  useAdminPopupCreateMutation,
  useAdminPopupUpdateMutation,
  useAdminPopupDeleteMutation,
} from "@/querys/admin/adminPopup.query";

export function useAdminPopups(params: AdminPopupListParams) {
  return useAdminPopupListQuery(params);
}

export function useAdminPopupDetail(popupId: AdminPopupId | null) {
  return useAdminPopupDetailQuery(popupId);
}

export function useAdminPopupCreate() {
  return useAdminPopupCreateMutation();
}

export function useAdminPopupUpdate() {
  return useAdminPopupUpdateMutation();
}

export function useAdminPopupDelete() {
  return useAdminPopupDeleteMutation();
}

export type { AdminPopupListParams, AdminPopupSaveRequest };
