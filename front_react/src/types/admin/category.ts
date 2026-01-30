// src/types/admin/category.ts

export type AdminCategoryId = number;

/**
 * 백엔드 enum (확정):
 * com.enfantTerrible.enfantTerrible.common.enums.CategoryStatus
 * - ACTIVE("Y")
 * - INACTIVE("N")
 */
export type CategoryStatus = "ACTIVE" | "INACTIVE";

/** 컨트롤러 /active 의 RequestParam 값(백 enum code) */
export type CategoryActiveCode = "Y" | "N";

/** status -> code(Y/N) */
export const statusToActiveCode = (status: CategoryStatus): CategoryActiveCode =>
  status === "ACTIVE" ? "Y" : "N";

/** code(Y/N) -> status */
export const activeCodeToStatus = (code: CategoryActiveCode): CategoryStatus =>
  code === "Y" ? "ACTIVE" : "INACTIVE";

/** 트리 응답 (CategoryResponse) */
export type AdminCategory = {
  categoryId: AdminCategoryId;
  parentId: AdminCategoryId | null;
  name: string;
  depth: number;
  sortOrder: number;
  status: CategoryStatus;
  children: AdminCategory[];
};

/** 평면 row (CategoryRow) */
export type AdminCategoryRow = Omit<AdminCategory, "children"> & {
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

/** 생성 payload (AdminCategoryCreateRequest에 맞춰 확정 필요) */
export type AdminCategoryCreatePayload = {
  parentId: AdminCategoryId | null;
  name: string;
  sortOrder?: number;
};

/** 수정 payload (AdminCategoryUpdateRequest에 맞춰 확정 필요) */
export type AdminCategoryUpdatePayload = {
  name?: string;
  sortOrder?: number;
  status?: CategoryStatus;
  parentId?: AdminCategoryId | null;
};

export type AdminCategoryReorderItem = {
  categoryId: AdminCategoryId;
  parentId: AdminCategoryId | null;
  sortOrder: number;
};

export type AdminCategoryReorderPayload = {
  items: AdminCategoryReorderItem[];
};
