// src/views/admin/categories/categories.types.ts
export type Category = {
  id: number;
  name: string;
  parentId: number | null;
  order: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

export type EditDraft = {
  id: number;
  name: string;
  parentId: number | null;
  order: number;
};

export type CreateDraft = {
  name: string;
  parentId: number | null;
  order: number;
};
