// src/apis/admin/request/adminPopup.request.ts

import { mainAxios } from "@/apis/admin/main_axios";
import type {
  AdminPopupId,
  AdminPopupListParams,
} from "@/types/admin/popup";

import type {
  GetPopupsResponse,
  GetPopupDetailResponse,
  CreatePopupResponse,
  UpdatePopupResponse,
  DeletePopupResponse,
} from "@/apis/admin/response/adminPopup.response";

function unwrapOrThrow<T>(res: { success: boolean; message: string; data: T }): T {
  if (!res.success) {
    // 프론트에서 임의 해석/가공하지 않고 백엔드 message 그대로 던집니다.
    throw new Error(res.message || "요청에 실패했습니다.");
  }
  return res.data;
}

export async function apiAdminPopupList(params: AdminPopupListParams) {
  const { data } = await mainAxios.get<GetPopupsResponse>("/api/admin/popups", { params });
  return unwrapOrThrow(data);
}

export async function apiAdminPopupDetail(popupId: AdminPopupId) {
  const { data } = await mainAxios.get<GetPopupDetailResponse>(`/api/admin/popups/${popupId}`);
  return unwrapOrThrow(data);
}

export async function apiAdminPopupCreate(body: FormData) {
  const { data } = await mainAxios.post<CreatePopupResponse>("/api/admin/popups", body);
  return unwrapOrThrow(data); // popupId
}

export async function apiAdminPopupUpdate(popupId: AdminPopupId, body: FormData) {
  const { data } = await mainAxios.put<UpdatePopupResponse>(`/api/admin/popups/${popupId}`, body);
  return unwrapOrThrow(data);
}

export async function apiAdminPopupDelete(popupId: AdminPopupId) {
  const { data } = await mainAxios.delete<DeletePopupResponse>(`/api/admin/popups/${popupId}`);
  return unwrapOrThrow(data);
}
