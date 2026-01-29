// src/apis/admin/request/adminBanner.request.ts

import { mainAxios } from "@/apis/admin/main_axios";

import type { AdminBannerId, AdminBannerListParams } from "@/types/admin/banner";
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
  const { data } = await mainAxios.get<GetBannersResponse>("/admin/banners", { params });
  return unwrapOrThrow(data);
}

export async function apiAdminBannerDetail(bannerId: AdminBannerId) {
  const { data } = await mainAxios.get<GetBannerDetailResponse>(`/admin/banners/${bannerId}`);
  return unwrapOrThrow(data);
}

export async function apiAdminBannerCreate(body: FormData) {
  const { data } = await mainAxios.post<CreateBannerResponse>("/admin/banners", body);
  return unwrapOrThrow(data); // bannerId
}

export async function apiAdminBannerUpdate(bannerId: AdminBannerId, body: FormData) {
  const { data } = await mainAxios.put<UpdateBannerResponse>(`/admin/banners/${bannerId}`, body);
  return unwrapOrThrow(data);
}

export async function apiAdminBannerDelete(bannerId: AdminBannerId) {
  const { data } = await mainAxios.delete<DeleteBannerResponse>(`/admin/banners/${bannerId}`);
  return unwrapOrThrow(data);
}
