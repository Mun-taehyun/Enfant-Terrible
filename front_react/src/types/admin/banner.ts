// src/types/admin/banner.ts

export type AdminBannerId = number;

export type AdminBannerListParams = {
  page: number; // 1-based
  size: number;
  title?: string;
  isActive?: boolean;
};

export type AdminBannerListItem = {
  bannerId: AdminBannerId;
  title: string;
  linkUrl?: string | null;
  sortOrder?: number | null;

  isActive?: boolean | null;
  startAt?: string | null; // LocalDateTime -> string
  endAt?: string | null;

  createdAt?: string | null;
};

export type AdminBannerDetail = {
  bannerId: AdminBannerId;
  title: string;
  linkUrl?: string | null;
  sortOrder?: number | null;

  isActive?: boolean | null;
  startAt?: string | null;
  endAt?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

export type AdminBannerSaveRequest = {
  title: string; // @NotBlank

  linkUrl?: string;
  sortOrder?: number;

  isActive?: boolean;
  startAt?: string; // LocalDateTime string
  endAt?: string;

  imageUrl?: string; // SaveRequest에만 존재 (응답 DTO에는 없음)
};
