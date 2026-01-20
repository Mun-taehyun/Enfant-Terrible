// src/query/admin/product.query.ts

import { queryOptions } from "@tanstack/react-query";
import type { AdminProductListParams, AdminSkuListParams } from "@/types/admin/product";

import {
  getAdminProducts,
  getAdminProductDetail,
  getAdminSkus,
  getAdminSkuDetail,
  getAdminOptionGroups,
  getAdminOptionValues,
} from "@/apis/admin/request/adminProduct.request";

export const adminProductKeys = {
  root: ["adminProduct"] as const,

  productsList: (params: AdminProductListParams) => [...adminProductKeys.root, "products", "list", params] as const,
  productDetail: (productId: number) => [...adminProductKeys.root, "products", "detail", productId] as const,

  skusList: (params: AdminSkuListParams) => [...adminProductKeys.root, "skus", "list", params] as const,
  skuDetail: (skuId: number) => [...adminProductKeys.root, "skus", "detail", skuId] as const,

  optionGroups: (productId: number) => [...adminProductKeys.root, "options", "groups", productId] as const,
  optionValues: (groupId: number) => [...adminProductKeys.root, "options", "values", groupId] as const,
};

export function adminProductsListOptions(params: AdminProductListParams) {
  return queryOptions({
    queryKey: adminProductKeys.productsList(params),
    queryFn: () => getAdminProducts(params),
  });
}

export function adminProductDetailOptions(productId: number) {
  return queryOptions({
    queryKey: adminProductKeys.productDetail(productId),
    queryFn: () => getAdminProductDetail(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  });
}

export function adminSkusListOptions(params: AdminSkuListParams) {
  return queryOptions({
    queryKey: adminProductKeys.skusList(params),
    queryFn: () => getAdminSkus(params),
  });
}

export function adminSkuDetailOptions(skuId: number) {
  return queryOptions({
    queryKey: adminProductKeys.skuDetail(skuId),
    queryFn: () => getAdminSkuDetail(skuId),
    enabled: Number.isFinite(skuId) && skuId > 0,
  });
}

export function adminOptionGroupsOptions(productId: number) {
  return queryOptions({
    queryKey: adminProductKeys.optionGroups(productId),
    queryFn: () => getAdminOptionGroups(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  });
}

export function adminOptionValuesOptions(groupId: number) {
  return queryOptions({
    queryKey: adminProductKeys.optionValues(groupId),
    queryFn: () => getAdminOptionValues(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
  });
}
