// src/apis/admin/response/adminBanner.response.ts

import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type { AdminBannerDetail, AdminBannerListItem } from "@/types/admin/banner";

export type GetBannersResponse = ApiResponse<AdminPageResponse<AdminBannerListItem>>;
export type GetBannerDetailResponse = ApiResponse<AdminBannerDetail>;
export type CreateBannerResponse = ApiResponse<number>; // bannerId
export type UpdateBannerResponse = ApiResponse<null>;
export type DeleteBannerResponse = ApiResponse<null>;
