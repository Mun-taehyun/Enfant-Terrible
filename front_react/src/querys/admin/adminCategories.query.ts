// src/query/admin/adminCategories.query.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminCategory,
  getAdminCategoryTree,
  moveAdminCategory,
  reorderAdminCategories,
  softDeleteAdminCategory,
  updateAdminCategory,
  updateAdminCategoryActive,
  updateAdminCategorySortOrder,
} from "@/apis/admin/request/adminCategory.request";

import type {
  AdminCategory,
  CategoryActiveCode, // ✅ AdminCategoryActive -> CategoryActiveCode
  AdminCategoryCreatePayload,
  AdminCategoryReorderPayload,
  AdminCategoryUpdatePayload,
} from "@/types/admin/category";

const QK = {
  tree: ["admin", "categories", "tree"] as const,
};

export function useAdminCategoryTree() {
  return useQuery<AdminCategory[]>({
    queryKey: QK.tree,
    queryFn: getAdminCategoryTree,
    staleTime: 30_000,
  });
}

export function useAdminCategoryCreate() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminCategoryCreatePayload>({
    mutationFn: (payload) => createAdminCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tree });
    },
  });
}

export function useAdminCategoryUpdate() {
  const qc = useQueryClient();
  return useMutation<void, Error, { categoryId: number; payload: AdminCategoryUpdatePayload }>({
    mutationFn: (args) => updateAdminCategory(args.categoryId, args.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tree });
    },
  });
}

export function useAdminCategoryToggleActive() {
  const qc = useQueryClient();
  return useMutation<void, Error, { categoryId: number; isActive: CategoryActiveCode }>({
    mutationFn: (args) => updateAdminCategoryActive(args.categoryId, args.isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tree });
    },
  });
}

export function useAdminCategorySortOrder() {
  const qc = useQueryClient();
  return useMutation<void, Error, { categoryId: number; sortOrder: number }>({
    mutationFn: (args) => updateAdminCategorySortOrder(args.categoryId, args.sortOrder),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tree });
    },
  });
}

export function useAdminCategoryMoveParent() {
  const qc = useQueryClient();
  return useMutation<void, Error, { categoryId: number; parentId: number | null }>({
    mutationFn: (args) => moveAdminCategory(args.categoryId, args.parentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tree });
    },
  });
}

export function useAdminCategorySoftDelete() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (categoryId) => softDeleteAdminCategory(categoryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tree });
    },
  });
}

export function useAdminCategoryReorder() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminCategoryReorderPayload>({
    mutationFn: (payload) => reorderAdminCategories(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tree });
    },
  });
}
