// src/hooks/admin/adminProduct.hook.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AdminProductListParams,
  AdminProductSavePayload,
  AdminSkuListParams,
  AdminSkuSavePayload,
  AdminOptionGroupSavePayload,
  AdminOptionValueSavePayload,
} from "@/types/admin/product";

import {
  adminProductsListOptions,
  adminProductDetailOptions,
  adminSkusListOptions,
  adminOptionGroupsOptions,
  adminOptionValuesOptions,
  adminProductKeys,
} from "@/querys/admin/adminProduct.query";

import {
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  updateAdminSku,
  createAdminOptionGroup,
  updateAdminOptionGroup,
  deleteAdminOptionGroup,
  createAdminOptionValue,
  updateAdminOptionValue,
  deleteAdminOptionValue,
} from "@/apis/admin/request/adminProduct.request";

/* Products */
export function useAdminProducts(params: AdminProductListParams) {
  return useQuery(adminProductsListOptions(params));
}

export function useAdminProductDetail(productId: number) {
  return useQuery(adminProductDetailOptions(productId));
}

export function useAdminProductCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminProductSavePayload) => createAdminProduct(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.root });
    },
  });
}

export function useAdminProductUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: number; payload: AdminProductSavePayload }) =>
      updateAdminProduct(vars.productId, vars.payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.root });
    },
  });
}

export function useAdminProductDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => deleteAdminProduct(productId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.root });
    },
  });
}

/* SKUs */
export function useAdminSkus(params: AdminSkuListParams) {
  return useQuery(adminSkusListOptions(params));
}

export function useAdminSkuUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { skuId: number; payload: AdminSkuSavePayload }) =>
      updateAdminSku(vars.skuId, vars.payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.root });
    },
  });
}

/* Options */
export function useAdminOptionGroups(productId: number) {
  return useQuery(adminOptionGroupsOptions(productId));
}

export function useAdminOptionValues(groupId: number) {
  return useQuery(adminOptionValuesOptions(groupId));
}

export function useAdminOptionGroupCreate(productIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminOptionGroupSavePayload) => createAdminOptionGroup(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.optionGroups(productIdForInvalidate) });
    },
  });
}

export function useAdminOptionGroupUpdate(productIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { groupId: number; payload: AdminOptionGroupSavePayload }) =>
      updateAdminOptionGroup(vars.groupId, vars.payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.optionGroups(productIdForInvalidate) });
    },
  });
}

export function useAdminOptionGroupDelete(productIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => deleteAdminOptionGroup(groupId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.optionGroups(productIdForInvalidate) });
    },
  });
}

export function useAdminOptionValueCreate(groupIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminOptionValueSavePayload) => createAdminOptionValue(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.optionValues(groupIdForInvalidate) });
    },
  });
}

export function useAdminOptionValueUpdate(groupIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { valueId: number; payload: AdminOptionValueSavePayload }) =>
      updateAdminOptionValue(vars.valueId, vars.payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.optionValues(groupIdForInvalidate) });
    },
  });
}

export function useAdminOptionValueDelete(groupIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (valueId: number) => deleteAdminOptionValue(valueId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.optionValues(groupIdForInvalidate) });
    },
  });
}
