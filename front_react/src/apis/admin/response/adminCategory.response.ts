// src/apis/admin/response/adminCategory.response.ts
import type { ApiResponse } from "@/types/admin/api";
import type { AdminCategory, AdminCategoryRow } from "@/types/admin/category";

export type GetAdminCategoryTreeResponse = ApiResponse<AdminCategory[]>;
export type GetAdminCategoriesResponse = ApiResponse<AdminCategoryRow[]>;
export type GetAdminCategoryResponse = ApiResponse<AdminCategoryRow>;
export type PostAdminCategoryResponse = ApiResponse<AdminCategoryRow>;
export type PutAdminCategoryResponse = ApiResponse<AdminCategoryRow>;
export type PatchAdminCategoryResponse = ApiResponse<null>;
export type DeleteAdminCategoryResponse = ApiResponse<null>;
export type ExistsAdminCategoryResponse = ApiResponse<{ exists: boolean }>;
