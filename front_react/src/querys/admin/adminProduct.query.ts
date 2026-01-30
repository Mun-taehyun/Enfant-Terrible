// src/querys/admin/adminProduct.query.ts
// ✅ TanStack Query v5 대응 + 타입 추론 깨짐 방지(placeholderData 때문에 data가 함수로 잡히는 문제 해결)

import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";
import type {
  AdminProductListParams,
  AdminSkuListParams,
  AdminProductPage,
  AdminSkuPage,
  AdminProductDetail,
  AdminOptionGroupItem,
  AdminOptionValueItem,
} from "@/types/admin/product";

import {
  getAdminProducts,
  getAdminProductDetail,
  getAdminSkus,
  getAdminOptionGroups,
  getAdminOptionValues,
  getAdminOptionValuesByProduct,
} from "@/apis/admin/request/adminProduct.request";

export const adminProductKeys = {
  root: ["admin", "products"] as const,

  list: (params: AdminProductListParams) =>
    [...adminProductKeys.root, "list", params] as const,

  detail: (productId: number) =>
    [...adminProductKeys.root, "detail", productId] as const,

  skus: (params: AdminSkuListParams) =>
    [...adminProductKeys.root, "skus", params] as const,

  optionGroups: (productId: number) =>
    [...adminProductKeys.root, "optionGroups", productId] as const,

  optionValues: (groupId: number) =>
    [...adminProductKeys.root, "optionValues", groupId] as const,

  optionValuesByProduct: (productId: number) =>
    [...adminProductKeys.root, "optionValuesByProduct", productId] as const,
};

export function adminProductsListOptions(
  params: AdminProductListParams
): UseQueryOptions<
  AdminProductPage, // TQueryFnData
  Error,            // TError
  AdminProductPage, // TData
  QueryKey          // TQueryKey
> {
  return {
    queryKey: adminProductKeys.list(params) as QueryKey,
    queryFn: () => getAdminProducts(params) as Promise<AdminProductPage>,

    // ✅ v5 keepPreviousData 대체
    // ✅ 타입을 AdminProductPage로 고정해서 data가 "함수"로 추론되는 사고를 막음
    placeholderData: (prev) =>
      (prev as AdminProductPage | undefined) ?? {
        page: params.page,
        size: params.size,
        totalCount: 0,
        list: [],
      },
  };
}

export function adminProductDetailOptions(
  productId: number
): UseQueryOptions<AdminProductDetail, Error, AdminProductDetail, QueryKey> {
  return {
    queryKey: adminProductKeys.detail(productId) as QueryKey,
    queryFn: () => getAdminProductDetail(productId) as Promise<AdminProductDetail>,
    enabled: productId > 0,
  };
}

export function adminSkusListOptions(
  params: AdminSkuListParams
): UseQueryOptions<AdminSkuPage, Error, AdminSkuPage, QueryKey> {
  return {
    queryKey: adminProductKeys.skus(params) as QueryKey,
    queryFn: () => getAdminSkus(params) as Promise<AdminSkuPage>,

    // ✅ v5 keepPreviousData 대체(타입 고정)
    placeholderData: (prev) =>
      (prev as AdminSkuPage | undefined) ?? {
        page: params.page,
        size: params.size,
        totalCount: 0,
        list: [],
      },
  };
}

export function adminOptionGroupsOptions(
  productId: number
): UseQueryOptions<AdminOptionGroupItem[], Error, AdminOptionGroupItem[], QueryKey> {
  return {
    queryKey: adminProductKeys.optionGroups(productId) as QueryKey,
    queryFn: () => getAdminOptionGroups(productId) as Promise<AdminOptionGroupItem[]>,
    enabled: productId > 0,
  };
}

export function adminOptionValuesOptions(
  groupId: number
): UseQueryOptions<AdminOptionValueItem[], Error, AdminOptionValueItem[], QueryKey> {
  return {
    queryKey: adminProductKeys.optionValues(groupId) as QueryKey,
    queryFn: () => getAdminOptionValues(groupId) as Promise<AdminOptionValueItem[]>,
    enabled: groupId > 0,
  };
}

export function adminOptionValuesByProductOptions(
  productId: number
): UseQueryOptions<AdminOptionValueItem[], Error, AdminOptionValueItem[], QueryKey> {
  return {
    queryKey: adminProductKeys.optionValuesByProduct(productId) as QueryKey,
    queryFn: () => getAdminOptionValuesByProduct(productId) as Promise<AdminOptionValueItem[]>,
    enabled: productId > 0,
  };
}
