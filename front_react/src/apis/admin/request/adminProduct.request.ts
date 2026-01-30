// src/apis/admin/request/adminProduct.request.ts
import { mainAxios } from "@/apis/admin/main_axios";

import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type {
  AdminProductListParams,
  AdminProductListItem,
  AdminProductDetail,
  AdminSkuListParams,
  AdminSkuItem,
  AdminSkuSavePayload,
  AdminOptionGroupItem,
  AdminOptionGroupSavePayload,
  AdminOptionGroupReorderPayload,
  AdminOptionValueItem,
  AdminOptionValueSavePayload,
  AdminOptionValueReorderPayload,
} from "@/types/admin/product";

function unwrapOrThrow<T>(res: ApiResponse<T>): T {
  if (!res || res.success !== true) {
    throw new Error(res?.message || "요청에 실패했습니다.");
  }
  return res.data;
}

/* ========================= Products ========================= */

export async function getAdminProducts(params: AdminProductListParams) {
  const { data } = await mainAxios.get<ApiResponse<AdminPageResponse<AdminProductListItem>>>(
    "/admin/products",
    { params }
  );
  return unwrapOrThrow(data);
}

export async function getAdminProductDetail(productId: number) {
  const { data } = await mainAxios.get<ApiResponse<AdminProductDetail>>(
    `/admin/products/${productId}`
  );
  return unwrapOrThrow(data);
}

export async function createAdminProduct(payload: FormData) {
  const { data } = await mainAxios.post<ApiResponse<null>>("/admin/products", payload);
  unwrapOrThrow(data);
}

export async function updateAdminProduct(productId: number, payload: FormData) {
  const { data } = await mainAxios.put<ApiResponse<null>>(
    `/admin/products/${productId}`,
    payload
  );
  unwrapOrThrow(data);
}

export async function deleteAdminProduct(productId: number) {
  const { data } = await mainAxios.delete<ApiResponse<null>>(
    `/admin/products/${productId}`
  );
  unwrapOrThrow(data);
}

export async function addAdminProductContentImages(productId: number, images: File[]) {
  const formData = new FormData();
  for (const f of images) {
    formData.append("images", f);
  }
  const { data } = await mainAxios.post<ApiResponse<null>>(
    `/admin/products/${productId}/content-images`,
    formData
  );
  unwrapOrThrow(data);
}

export async function deleteAdminProductContentImage(productId: number, fileId: number) {
  const { data } = await mainAxios.delete<ApiResponse<null>>(
    `/admin/products/${productId}/content-images/${fileId}`
  );
  unwrapOrThrow(data);
}

/* ========================= SKUs ========================= */

export async function getAdminSkus(params: AdminSkuListParams) {
  const { data } = await mainAxios.get<ApiResponse<AdminPageResponse<AdminSkuItem>>>(
    "/admin/products/skus",
    { params }
  );
  return unwrapOrThrow(data);
}

export async function updateAdminSku(skuId: number, payload: AdminSkuSavePayload) {
  const { data } = await mainAxios.put<ApiResponse<null>>(
    `/admin/products/skus/${skuId}`,
    payload
  );
  unwrapOrThrow(data);
}

/* ========================= Options ========================= */

export async function getAdminOptionGroups(productId: number) {
  const { data } = await mainAxios.get<ApiResponse<AdminOptionGroupItem[]>>(
    "/admin/products/options/groups",
    { params: { productId } }
  );
  return unwrapOrThrow(data);
}

export async function createAdminOptionGroup(payload: AdminOptionGroupSavePayload) {
  const { data } = await mainAxios.post<ApiResponse<null>>(
    "/admin/products/options/groups",
    payload
  );
  unwrapOrThrow(data);
}

export async function updateAdminOptionGroup(groupId: number, payload: AdminOptionGroupSavePayload) {
  const { data } = await mainAxios.put<ApiResponse<null>>(
    `/admin/products/options/groups/${groupId}`,
    payload
  );
  unwrapOrThrow(data);
}

export async function reorderAdminOptionGroups(payload: AdminOptionGroupReorderPayload) {
  const { data } = await mainAxios.put<ApiResponse<null>>(
    "/admin/products/options/groups/reorder",
    payload
  );
  unwrapOrThrow(data);
}

export async function deleteAdminOptionGroup(groupId: number) {
  const { data } = await mainAxios.delete<ApiResponse<null>>(
    `/admin/products/options/groups/${groupId}`
  );
  unwrapOrThrow(data);
}

export async function getAdminOptionValues(groupId: number) {
  const { data } = await mainAxios.get<ApiResponse<AdminOptionValueItem[]>>(
    "/admin/products/options/values",
    { params: { groupId } }
  );
  return unwrapOrThrow(data);
}

export async function getAdminOptionValuesByProduct(productId: number) {
  const { data } = await mainAxios.get<ApiResponse<AdminOptionValueItem[]>>(
    "/admin/products/options/values/by-product",
    { params: { productId } }
  );
  return unwrapOrThrow(data);
}

export async function createAdminOptionValue(payload: AdminOptionValueSavePayload) {
  const { data } = await mainAxios.post<ApiResponse<null>>(
    "/admin/products/options/values",
    payload
  );
  unwrapOrThrow(data);
}

export async function updateAdminOptionValue(
  valueId: number,
  payload: AdminOptionValueSavePayload
) {
  const { data } = await mainAxios.put<ApiResponse<null>>(
    `/admin/products/options/values/${valueId}`,
    payload
  );
  unwrapOrThrow(data);
}

export async function reorderAdminOptionValues(payload: AdminOptionValueReorderPayload) {
  const { data } = await mainAxios.put<ApiResponse<null>>(
    "/admin/products/options/values/reorder",
    payload
  );
  unwrapOrThrow(data);
}

export async function deleteAdminOptionValue(valueId: number) {
  const { data } = await mainAxios.delete<ApiResponse<null>>(
    `/admin/products/options/values/${valueId}`
  );
  unwrapOrThrow(data);
}
