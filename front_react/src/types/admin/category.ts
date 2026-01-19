// src/types/admin/category.ts
export type AdminCategoryId = number;
export type AdminCategoryActive = "Y" | "N";

export type AdminCategory = {
  categoryId: AdminCategoryId;
  parentId: AdminCategoryId | null;
  name: string;
  depth: number;
  sortOrder: number;
  isActive: AdminCategoryActive;
  children: AdminCategory[]; // 트리용(조회 API에서 제공)
};

// 관리자 목록/상세(트리 없이 평면으로도 쓸 수 있게)
export type AdminCategoryRow = Omit<AdminCategory, "children"> & {
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

// 생성/수정 payload
export type AdminCategoryCreatePayload = {
  parentId: AdminCategoryId | null;
  name: string;
  sortOrder?: number;
  // depth는 보통 서버에서 계산(부모 depth + 1)
};

export type AdminCategoryUpdatePayload = {
  name?: string;
  parentId?: AdminCategoryId | null;
  depth?: number;
  sortOrder?: number;
  isActive?: AdminCategoryActive;
};
