// src/hooks/admin/adminCategories.ts

import { useMemo, useState } from "react";
import type { AdminCategory, AdminCategoryId } from "@/types/admin/category";
import {
  useAdminCategoryCreate,
  useAdminCategoryMoveParent,
  useAdminCategorySoftDelete,
  useAdminCategorySortOrder,
  useAdminCategoryToggleActive,
  useAdminCategoryTree,
  useAdminCategoryUpdate,
} from "@/querys/admin/adminCategories.query";

function sortTreeByOrder(nodes: AdminCategory[]): AdminCategory[] {
  const sorted = [...nodes].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted.map((n) => ({
    ...n,
    children: sortTreeByOrder(n.children ?? []),
  }));
}

function flattenTree(nodes: AdminCategory[], out: AdminCategory[] = []): AdminCategory[] {
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) flattenTree(n.children, out);
  }
  return out;
}

/**
 * 서버가 트리를 내려주면 그대로 사용하고,
 * 서버가 평면(=children이 비어있고 parentId만 있는 형태)으로 내려주면 parentId로 트리를 재구성합니다.
 */
function ensureTree(raw: AdminCategory[]): AdminCategory[] {
  // 이미 children이 실제로 채워진 트리면 그대로
  const hasAnyChildren = raw.some((n) => (n.children?.length ?? 0) > 0);
  if (hasAnyChildren) return raw;

  // 평면이면 트리로 재구성
  const map = new Map<number, AdminCategory>();
  const roots: AdminCategory[] = [];

  // 1) 노드 복사본(children 초기화) 만들기
  for (const n of raw) {
    map.set(n.categoryId, { ...n, children: [] });
  }

  // 2) parentId로 연결
  for (const n of raw) {
    const node = map.get(n.categoryId);
    if (!node) continue;

    if (node.parentId === null) {
      roots.push(node);
      continue;
    }

    const parent = map.get(node.parentId);
    if (!parent) {
      // 부모가 없으면 루트로 취급(데이터 불일치 방어)
      roots.push(node);
      continue;
    }

    parent.children.push(node);
  }

  return roots;
}

export function useAdminCategoriesPage() {
  const [selectedId, setSelectedId] = useState<AdminCategoryId | null>(null);

  const treeQuery = useAdminCategoryTree();

  const createMut = useAdminCategoryCreate();
  const updateMut = useAdminCategoryUpdate();
  const toggleMut = useAdminCategoryToggleActive();
  const sortMut = useAdminCategorySortOrder();
  const moveMut = useAdminCategoryMoveParent();
  const deleteMut = useAdminCategorySoftDelete();

  // ✅ treeQuery.data는 이미 AdminCategory[] 입니다 (중첩 .data 금지)
  const tree = useMemo(() => {
    const raw = treeQuery.data ?? [];
    const normalized = ensureTree(raw);
    return sortTreeByOrder(normalized);
  }, [treeQuery.data]);

  const flat = useMemo(() => flattenTree(tree, []), [tree]);

  // ✅ 상세 API 없이도 selected 확보 (토글/이동/정렬에 필수)
  const selected = useMemo(() => {
    if (selectedId === null) return null;
    return flat.find((c) => c.categoryId === selectedId) ?? null;
  }, [flat, selectedId]);

  return {
    selectedId,
    setSelectedId,

    treeQuery,
    tree,
    flat,
    selected,

    createMut,
    updateMut,
    toggleMut,
    sortMut,
    moveMut,
    deleteMut,
  };
}
