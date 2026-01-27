// src/types/admin/popup.ts

export type AdminPopupId = number;

export type AdminPopupPosition = string; // 백엔드 enum 확정되면 union으로 잠그세요

export type AdminPopupListItem = {
  popupId: AdminPopupId;
  title: string;
  linkUrl?: string | null;
  position?: AdminPopupPosition | null;

  isActive?: boolean | null;
  startAt?: string | null;  // LocalDateTime -> ISO string
  endAt?: string | null;

  createdAt?: string | null;
};

export type AdminPopupDetail = {
  popupId: AdminPopupId;
  title: string;
  content?: string | null;
  linkUrl?: string | null;

  position?: AdminPopupPosition | null;
  width?: number | null;
  height?: number | null;

  isActive?: boolean | null;
  startAt?: string | null;
  endAt?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

export type AdminPopupListParams = {
  page: number;  // 백엔드 req 기본 1
  size: number;  // 백엔드 req 기본 20
  title?: string;
  isActive?: boolean;
};

export type AdminPopupSaveRequest = {
  title: string;              // @NotBlank
  content?: string;
  linkUrl?: string;

  position?: string;
  width?: number;
  height?: number;

  isActive?: boolean;
  startAt?: string;           // LocalDateTime -> ISO string
  endAt?: string;

  imageUrl?: string;
};
