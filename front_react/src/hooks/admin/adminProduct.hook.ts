// src/hooks/admin/adminProduct.hook.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AdminProductListParams,
  AdminSkuListParams,
  AdminSkuSavePayload,
  AdminOptionGroupSavePayload,
  AdminOptionValueSavePayload,
  AdminOptionGroupReorderPayload,
  AdminOptionValueReorderPayload,
} from "@/types/admin/product";

import {
  adminProductsListOptions,
  adminProductDetailOptions,
  adminSkusListOptions,
  adminOptionGroupsOptions,
  adminOptionValuesOptions,
  adminOptionValuesByProductOptions,
  adminProductKeys,
} from "@/querys/admin/adminProduct.query";

import {
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  addAdminProductContentImages,
  deleteAdminProductContentImage,
  updateAdminSku,
  createAdminOptionGroup,
  updateAdminOptionGroup,
  deleteAdminOptionGroup,
  reorderAdminOptionGroups,
  createAdminOptionValue,
  updateAdminOptionValue,
  deleteAdminOptionValue,
  reorderAdminOptionValues,
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
    mutationFn: (payload: FormData) => createAdminProduct(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.root });
    },
  });
}

export function useAdminProductUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: number; payload: FormData }) =>
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

export function useAdminProductContentImagesAdd(productIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (images: File[]) => addAdminProductContentImages(productIdForInvalidate, images),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.detail(productIdForInvalidate) });
    },
  });
}

export function useAdminProductContentImageDelete(productIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId: number) => deleteAdminProductContentImage(productIdForInvalidate, fileId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.detail(productIdForInvalidate) });
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

export function useAdminOptionValuesByProduct(productId: number) {
  return useQuery(adminOptionValuesByProductOptions(productId));
}

export function useAdminOptionGroupCreate(productIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminOptionGroupSavePayload) => createAdminOptionGroup(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.optionGroups(productIdForInvalidate) });
      await qc.invalidateQueries({ queryKey: [...adminProductKeys.root, "skus"] });
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
      await qc.invalidateQueries({ queryKey: [...adminProductKeys.root, "skus"] });
    },
  });
}

export function useAdminOptionGroupReorder(productIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminOptionGroupReorderPayload) => reorderAdminOptionGroups(payload),
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
      await qc.invalidateQueries({ queryKey: [...adminProductKeys.root, "optionValuesByProduct"] });
      await qc.invalidateQueries({ queryKey: [...adminProductKeys.root, "skus"] });
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
      await qc.invalidateQueries({ queryKey: [...adminProductKeys.root, "optionValuesByProduct"] });
    },
  });
}

export function useAdminOptionValueDelete(groupIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (valueId: number) => deleteAdminOptionValue(valueId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.optionValues(groupIdForInvalidate) });
      await qc.invalidateQueries({ queryKey: [...adminProductKeys.root, "optionValuesByProduct"] });
      await qc.invalidateQueries({ queryKey: [...adminProductKeys.root, "skus"] });
    },
  });
}

export function useAdminOptionValueReorder(groupIdForInvalidate: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminOptionValueReorderPayload) => reorderAdminOptionValues(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminProductKeys.optionValues(groupIdForInvalidate) });
      await qc.invalidateQueries({ queryKey: [...adminProductKeys.root, "optionValuesByProduct"] });
    },
  });
}
