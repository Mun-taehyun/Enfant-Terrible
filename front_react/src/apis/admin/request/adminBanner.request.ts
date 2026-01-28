// src/apis/admin/request/adminBanner.request.ts

import { mainAxios } from "@/apis/admin/main_axios";

import type { AdminBannerId, AdminBannerListParams, AdminBannerSaveRequest } from "@/types/admin/banner";
import type {
  GetBannersResponse,
  GetBannerDetailResponse,
  CreateBannerResponse,
  UpdateBannerResponse,
  DeleteBannerResponse,
} from "@/apis/admin/response/adminBanner.response";

function unwrapOrThrow<T>(res: { success: boolean; message: string; data: T }): T {
  if (!res.success) {
    throw new Error(res.message || "요청에 실패했습니다.");
  }
  return res.data;
}

export async function apiAdminBannerList(params: AdminBannerListParams) {
  const { data } = await mainAxios.get<GetBannersResponse>("/api/admin/banners", { params });
  return unwrapOrThrow(data);
}

export async function apiAdminBannerDetail(bannerId: AdminBannerId) {
  const { data } = await mainAxios.get<GetBannerDetailResponse>(`/api/admin/banners/${bannerId}`);
  return unwrapOrThrow(data);
}

export async function apiAdminBannerCreate(body: AdminBannerSaveRequest) {
  const { data } = await mainAxios.post<CreateBannerResponse>("/api/admin/banners", body);
  return unwrapOrThrow(data); // bannerId
}

export async function apiAdminBannerUpdate(bannerId: AdminBannerId, body: AdminBannerSaveRequest) {
  const { data } = await mainAxios.put<UpdateBannerResponse>(`/api/admin/banners/${bannerId}`, body);
  return unwrapOrThrow(data);
}

export async function apiAdminBannerDelete(bannerId: AdminBannerId) {
  const { data } = await mainAxios.delete<DeleteBannerResponse>(`/api/admin/banners/${bannerId}`);
  return unwrapOrThrow(data);
}
