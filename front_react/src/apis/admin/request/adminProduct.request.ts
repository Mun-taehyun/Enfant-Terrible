// src/apis/admin/request/product.request.ts

import { mainAxios } from "@/apis/admin/main_axios";

import type { AdminPageResponse, ApiResponse } from "@/types/admin/api";
import type {
  AdminProduct,
  AdminProductListParams,
  AdminProductSavePayload,
  AdminSku,
  AdminSkuListParams,
  AdminSkuSavePayload,
  AdminProductOptionGroup,
  AdminProductOptionValue,
  AdminOptionGroupSavePayload,
  AdminOptionValueSavePayload,
} from "@/types/admin/product";

import type {
  AdminVoidResponse,
  GetAdminProductsResponse,
  GetAdminProductDetailResponse,
  GetAdminSkusResponse,
  GetAdminSkuDetailResponse,
  GetAdminOptionGroupsResponse,
  GetAdminOptionValuesResponse,
} from "@/apis/admin/response/adminProduct.response";

function unwrapOrThrow<T>(res: ApiResponse<T>): T {
  if (!res || res.success !== true) {
    const msg = res?.message || "요청에 실패했습니다.";
    throw new Error(msg);
  }
  return res.data;
}

function toParams(obj: Record<string, unknown>) {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s) return;
    params.set(k, s);
  });
  return params;
}

/* ========================= Products ========================= */

export async function getAdminProducts(params: AdminProductListParams): Promise<AdminPageResponse<AdminProduct>> {
  const query = toParams({
    page: params.page ?? 1,
    size: params.size ?? 10,
    keyword: params.keyword,
    productCode: params.productCode,
    status: params.status,
  });

  const { data } = await mainAxios.get<GetAdminProductsResponse>(`/api/admin/products?${query.toString()}`);
  return unwrapOrThrow(data);
}

export async function getAdminProductDetail(productId: number): Promise<AdminProduct> {
  const { data } = await mainAxios.get<GetAdminProductDetailResponse>(`/api/admin/products/${productId}`);
  return unwrapOrThrow(data);
}

export async function createAdminProduct(payload: AdminProductSavePayload): Promise<void> {
  const { data } = await mainAxios.post<AdminVoidResponse>(`/api/admin/products`, payload);
  unwrapOrThrow(data);
}

export async function updateAdminProduct(productId: number, payload: AdminProductSavePayload): Promise<void> {
  const { data } = await mainAxios.put<AdminVoidResponse>(`/api/admin/products/${productId}`, payload);
  unwrapOrThrow(data);
}

export async function deleteAdminProduct(productId: number): Promise<void> {
  const { data } = await mainAxios.delete<AdminVoidResponse>(`/api/admin/products/${productId}`);
  unwrapOrThrow(data);
}

/* ========================= SKUs ========================= */

export async function getAdminSkus(params: AdminSkuListParams): Promise<AdminPageResponse<AdminSku>> {
  const query = toParams({
    page: params.page ?? 1,
    size: params.size ?? 10,
    productId: params.productId,
    status: params.status,
  });

  const { data } = await mainAxios.get<GetAdminSkusResponse>(`/api/admin/products/skus?${query.toString()}`);
  return unwrapOrThrow(data);
}

export async function getAdminSkuDetail(skuId: number): Promise<AdminSku> {
  const { data } = await mainAxios.get<GetAdminSkuDetailResponse>(`/api/admin/products/skus/${skuId}`);
  return unwrapOrThrow(data);
}

// PUT /api/admin/products/skus/{skuId}
// 바디는 AdminSkuSaveRequest 그대로 (productId가 @NotNull이라 반드시 포함)
export async function updateAdminSku(skuId: number, payload: AdminSkuSavePayload): Promise<void> {
  const { data } = await mainAxios.put<AdminVoidResponse>(`/api/admin/products/skus/${skuId}`, payload);
  unwrapOrThrow(data);
}

/* ========================= Options ========================= */

// GET /api/admin/products/options/groups?productId=...
export async function getAdminOptionGroups(productId: number): Promise<AdminProductOptionGroup[]> {
  const { data } = await mainAxios.get<GetAdminOptionGroupsResponse>(`/api/admin/products/options/groups`, {
    params: { productId },
  });
  return unwrapOrThrow(data);
}

export async function createAdminOptionGroup(payload: AdminOptionGroupSavePayload): Promise<void> {
  const { data } = await mainAxios.post<AdminVoidResponse>(`/api/admin/products/options/groups`, payload);
  unwrapOrThrow(data);
}

export async function updateAdminOptionGroup(groupId: number, payload: AdminOptionGroupSavePayload): Promise<void> {
  const { data } = await mainAxios.put<AdminVoidResponse>(`/api/admin/products/options/groups/${groupId}`, payload);
  unwrapOrThrow(data);
}

export async function deleteAdminOptionGroup(groupId: number): Promise<void> {
  const { data } = await mainAxios.delete<AdminVoidResponse>(`/api/admin/products/options/groups/${groupId}`);
  unwrapOrThrow(data);
}

// GET /api/admin/products/options/values?groupId=...
export async function getAdminOptionValues(groupId: number): Promise<AdminProductOptionValue[]> {
  const { data } = await mainAxios.get<GetAdminOptionValuesResponse>(`/api/admin/products/options/values`, {
    params: { groupId },
  });
  return unwrapOrThrow(data);
}

export async function createAdminOptionValue(payload: AdminOptionValueSavePayload): Promise<void> {
  const { data } = await mainAxios.post<AdminVoidResponse>(`/api/admin/products/options/values`, payload);
  unwrapOrThrow(data);
}

export async function updateAdminOptionValue(valueId: number, payload: AdminOptionValueSavePayload): Promise<void> {
  const { data } = await mainAxios.put<AdminVoidResponse>(`/api/admin/products/options/values/${valueId}`, payload);
  unwrapOrThrow(data);
}

export async function deleteAdminOptionValue(valueId: number): Promise<void> {
  const { data } = await mainAxios.delete<AdminVoidResponse>(`/api/admin/products/options/values/${valueId}`);
  unwrapOrThrow(data);
}
