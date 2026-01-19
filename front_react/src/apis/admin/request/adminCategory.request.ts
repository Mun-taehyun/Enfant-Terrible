// src/apis/admin/request/adminCategory.request.ts

import { mainAxios } from "@/apis/admin/main_axios";
import type {
  AdminCategory,
  AdminCategoryActive,
  AdminCategoryCreatePayload,
  AdminCategoryUpdatePayload,
} from "@/types/admin/category";
import type { ApiResponse } from "@/types/admin/api";

const BASE = "/api/admin/categories";

function unwrap<T>(res: ApiResponse<T>): T {
  return res.data;
}

export async function getAdminCategoryTree(): Promise<AdminCategory[]> {
  // ✅ 운영 백: GET /api/admin/categories (트리)
  const res = await mainAxios.get<ApiResponse<AdminCategory[]>>(BASE);
  return unwrap(res.data);
}

export async function createAdminCategory(payload: AdminCategoryCreatePayload): Promise<void> {
  // ✅ 운영 백: POST /api/admin/categories, ApiResponse<Void>
  await mainAxios.post<ApiResponse<null>>(BASE, payload);
}

export async function updateAdminCategory(categoryId: number, payload: AdminCategoryUpdatePayload): Promise<void> {
  // ✅ 운영 백: PATCH /api/admin/categories/{categoryId}, ApiResponse<Void>
  await mainAxios.patch<ApiResponse<null>>(`${BASE}/${categoryId}`, payload);
}

export async function updateAdminCategoryActive(categoryId: number, isActive: AdminCategoryActive): Promise<void> {
  // ✅ 운영 백: PATCH /{id}/active?isActive=Y|N (RequestParam)
  // 🚫 body에 null 보내면(mock express/body-parser)에서 "null is not valid JSON" 터질 수 있음
  // ✅ 빈 객체 {}로 고정
  await mainAxios.patch<ApiResponse<null>>(`${BASE}/${categoryId}/active`, {}, { params: { isActive } });
}

export async function updateAdminCategorySortOrder(categoryId: number, sortOrder: number): Promise<void> {
  // ✅ 운영 백: PATCH /{id}/sort-order?sortOrder=... (RequestParam)
  await mainAxios.patch<ApiResponse<null>>(`${BASE}/${categoryId}/sort-order`, {}, { params: { sortOrder } });
}

export async function moveAdminCategory(categoryId: number, parentId: number | null): Promise<void> {
  // ✅ 운영 백: PATCH /{id}/move?parentId=... (nullable RequestParam)
  // parentId가 null이면 RequestParam 자체를 보내지 않는 형태로 맞춤
  const params: { parentId?: number } = {};
  if (parentId !== null) params.parentId = parentId;

  await mainAxios.patch<ApiResponse<null>>(`${BASE}/${categoryId}/move`, {}, { params });
}

export async function softDeleteAdminCategory(categoryId: number): Promise<void> {
  // ✅ 운영 백: DELETE /{id}
  // DELETE도 body 보내지 않음 (data:null 같은 거 금지)
  await mainAxios.delete<ApiResponse<null>>(`${BASE}/${categoryId}`);
}
