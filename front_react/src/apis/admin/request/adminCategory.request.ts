// src/apis/admin/request/adminCategory.request.ts

import { mainAxios } from "@/apis/admin/main_axios";
import type {
  AdminCategory,
  CategoryActiveCode, // ✅ "Y" | "N"
  AdminCategoryCreatePayload,
  AdminCategoryUpdatePayload,
} from "@/types/admin/category";
import type { ApiResponse } from "@/types/admin/api";

const BASE = "/admin/categories";

function unwrap<T>(res: ApiResponse<T>): T {
  return res.data;
}

export async function getAdminCategoryTree(): Promise<AdminCategory[]> {
  // ✅ 운영 백: GET /api/admin/categories (트리)
  const res = await mainAxios.get<ApiResponse<AdminCategory[]>>(BASE);
  return unwrap(res.data);
}

export async function createAdminCategory(payload: AdminCategoryCreatePayload): Promise<void> {
  // ✅ 운영 백: POST /api/admin/categories
  await mainAxios.post<ApiResponse<null>>(BASE, payload);
}

export async function updateAdminCategory(
  categoryId: number,
  payload: AdminCategoryUpdatePayload
): Promise<void> {
  // ✅ 운영 백: PATCH /api/admin/categories/{categoryId}
  await mainAxios.patch<ApiResponse<null>>(`${BASE}/${categoryId}`, payload);
}

export async function updateAdminCategoryActive(
  categoryId: number,
  isActive: CategoryActiveCode // ✅ AdminCategoryActive -> CategoryActiveCode
): Promise<void> {
  // ✅ 운영 백: PATCH /{id}/active?isActive=Y|N (RequestParam)
  await mainAxios.patch<ApiResponse<null>>(
    `${BASE}/${categoryId}/active`,
    {},
    { params: { isActive } }
  );
}

export async function updateAdminCategorySortOrder(
  categoryId: number,
  sortOrder: number
): Promise<void> {
  // ✅ 운영 백: PATCH /{id}/sort-order?sortOrder=...
  await mainAxios.patch<ApiResponse<null>>(
    `${BASE}/${categoryId}/sort-order`,
    {},
    { params: { sortOrder } }
  );
}

export async function moveAdminCategory(categoryId: number, parentId: number | null): Promise<void> {
  // ✅ 운영 백: PATCH /{id}/move?parentId=... (nullable)
  // parentId=null이면 RequestParam 자체를 보내지 않음 (= Spring @RequestParam(required=false) Long parentId)
  const params: { parentId?: number } = {};
  if (parentId !== null) params.parentId = parentId;

  await mainAxios.patch<ApiResponse<null>>(`${BASE}/${categoryId}/move`, {}, { params });
}

export async function softDeleteAdminCategory(categoryId: number): Promise<void> {
  // ✅ 운영 백: DELETE /{id}
  await mainAxios.delete<ApiResponse<null>>(`${BASE}/${categoryId}`);
}
