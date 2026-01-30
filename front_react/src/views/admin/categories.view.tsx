// src/views/admin/categories/categories.view.tsx

import { useEffect, useMemo, useState } from "react";
import styles from "./categories.view.module.css";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { AdminCategory, CategoryActiveCode } from "@/types/admin/category";
import { statusToActiveCode } from "@/types/admin/category";
import { useAdminCategoriesPage } from "@/hooks/admin/adminCategories.hook";

type CodeMap = Map<number, string>;

function buildCodeMap(tree: AdminCategory[]): CodeMap {
  const map: CodeMap = new Map();

  function walk(nodes: AdminCategory[], prefix: string | null) {
    nodes.forEach((node, idx) => {
      const code = prefix ? `${prefix}-${idx + 1}` : `${idx + 1}`;
      map.set(node.categoryId, code);
      if (node.children?.length) walk(node.children, code);
    });
  }

  walk(tree, null);
  return map;
}

const isActiveStatus = (status: AdminCategory["status"]) => status === "ACTIVE";

type TreeNode = AdminCategory;

const NODE_ID = (id: number) => `node:${id}`;
const DROP_CHILD_ID = (id: number) => `drop-child:${id}`;
const ROOT_DROP_ID = "drop-root";

function flattenWithParent(nodes: TreeNode[], parentId: number | null, out: Array<{ id: number; parentId: number | null }> = []) {
  for (const n of nodes) {
    out.push({ id: n.categoryId, parentId });
    if (n.children?.length) flattenWithParent(n.children, n.categoryId, out);
  }
  return out;
}

function findNode(nodes: TreeNode[], id: number): TreeNode | null {
  for (const n of nodes) {
    if (n.categoryId === id) return n;
    const child = n.children?.length ? findNode(n.children, id) : null;
    if (child) return child;
  }
  return null;
}

function removeNode(nodes: TreeNode[], id: number): { next: TreeNode[]; removed: TreeNode | null } {
  const next: TreeNode[] = [];
  let removed: TreeNode | null = null;

  for (const n of nodes) {
    if (n.categoryId === id) {
      removed = n;
      continue;
    }
    const hasChildren = n.children?.length ?? 0;
    if (hasChildren) {
      const r = removeNode(n.children, id);
      if (r.removed) removed = r.removed;
      next.push({ ...n, children: r.next });
    } else {
      next.push(n);
    }
  }

  return { next, removed };
}

function insertNode(nodes: TreeNode[], parentId: number | null, index: number, node: TreeNode): TreeNode[] {
  if (parentId === null) {
    const next = [...nodes];
    next.splice(index, 0, node);
    return next;
  }

  return nodes.map((n) => {
    if (n.categoryId !== parentId) {
      return n.children?.length ? { ...n, children: insertNode(n.children, parentId, index, node) } : n;
    }

    const children = [...(n.children ?? [])];
    const safeIndex = Math.max(0, Math.min(index, children.length));
    children.splice(safeIndex, 0, node);
    return { ...n, children };
  });
}

function computeReorderPayload(tree: TreeNode[]) {
  const items: Array<{ categoryId: number; parentId: number | null; sortOrder: number }> = [];

  function walk(nodes: TreeNode[], parentId: number | null) {
    for (let i = 0; i < nodes.length; i += 1) {
      const n = nodes[i];
      items.push({ categoryId: n.categoryId, parentId, sortOrder: i + 1 });
      if (n.children?.length) walk(n.children, n.categoryId);
    }
  }

  walk(tree, null);
  return { items };
}

function asNumberId(v: unknown): number | null {
  if (typeof v !== "string") return null;
  const parts = v.split(":");
  if (parts.length !== 2) return null;
  const n = Number(parts[1]);
  return Number.isFinite(n) ? n : null;
}

function DropZone({ id, label }: { id: string; label: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={isOver ? `${styles.dropZone} ${styles.dropZoneOver}` : styles.dropZone}
    >
      {label}
    </div>
  );
}

function SortableNode({
  node,
  code,
  selected,
  onSelect,
  children,
}: {
  node: TreeNode;
  code: string;
  selected: boolean;
  onSelect: (n: TreeNode) => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: NODE_ID(node.categoryId),
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const active = isActiveStatus(node.status);

  return (
    <li ref={setNodeRef} style={style} className={styles.nodeItem}>
      <button
        type="button"
        className={
          selected
            ? `${styles.nodeBtn} ${styles.nodeBtnActive} ${isDragging ? styles.dragging : ""}`
            : `${styles.nodeBtn} ${isDragging ? styles.dragging : ""}`
        }
        onClick={() => onSelect(node)}
        {...attributes}
        {...listeners}
      >
        <span className={styles.nodeName}>
          <span className={styles.nodeMeta}>{code}</span> {node.name}
        </span>
        <span className={active ? styles.badgeActive : styles.badgeInactive}>{active ? "Y" : "N"}</span>
      </button>

      <DropZone id={DROP_CHILD_ID(node.categoryId)} label="여기로 드랍하면 하위로 이동" />
      {children}
    </li>
  );
}

// ✅ 백/훅에서 throw된 Error.message(=백 message) 우선 표시
function errorText(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  try {
    const s = JSON.stringify(err);
    return s && s !== "{}" ? s : fallback;
  } catch {
    return fallback;
  }
}

export default function CategoriesView() {
  const {
    selectedId,
    setSelectedId,
    treeQuery,
    tree,
    flat,
    selected,

    createMut,
    updateMut,
    toggleMut,
    reorderMut,
    deleteMut,
  } = useAdminCategoriesPage();

  // ✅ 루트 생성
  const [newRootName, setNewRootName] = useState("");

  // ✅ 하위 생성
  const [newChildName, setNewChildName] = useState("");

  const [editName, setEditName] = useState("");

  const [localTree, setLocalTree] = useState<TreeNode[]>([]);

  const onSelect = (node: AdminCategory) => {
    setSelectedId(node.categoryId);
    setEditName(node.name);
  };

  useEffect(() => {
    setLocalTree(tree);
  }, [tree]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const codeMapLocal = useMemo(() => buildCodeMap(localTree), [localTree]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const activeIdStr = String(event.active.id);
    const overIdStr = event.over ? String(event.over.id) : null;
    if (!overIdStr) return;

    if (!activeIdStr.startsWith("node:")) return;

    const draggedId = asNumberId(activeIdStr);
    if (draggedId == null) return;

    const flat = flattenWithParent(localTree, null);
    const draggedInfo = flat.find((x) => x.id === draggedId);
    if (!draggedInfo) return;

    let targetParentId: number | null = draggedInfo.parentId;
    let targetIndex: number | null = null;

    if (overIdStr === ROOT_DROP_ID) {
      targetParentId = null;
      targetIndex = localTree.length;
    } else if (overIdStr.startsWith("drop-child:")) {
      targetParentId = asNumberId(overIdStr);
      const parent = targetParentId == null ? null : findNode(localTree, targetParentId);
      const children = parent?.children ?? [];
      targetIndex = children.length;
    } else if (overIdStr.startsWith("node:")) {
      const overNodeId = asNumberId(overIdStr);
      if (overNodeId == null) return;
      const overInfo = flat.find((x) => x.id === overNodeId);
      if (!overInfo) return;
      targetParentId = overInfo.parentId;

      const siblings = flat.filter((x) => x.parentId === targetParentId).map((x) => x.id);
      const fromIdx = siblings.indexOf(draggedId);
      const toIdx = siblings.indexOf(overNodeId);
      if (fromIdx < 0 || toIdx < 0) return;
      if (fromIdx === toIdx && draggedInfo.parentId === targetParentId) return;
      targetIndex = toIdx;
    } else {
      return;
    }

    if (targetIndex == null) return;

    // 사이클 방지(프론트 선방): 내 서브트리로 이동 금지
    if (targetParentId != null) {
      const draggedNode = findNode(localTree, draggedId);
      const subtreeIds = new Set<number>();
      (function collect(n: TreeNode | null) {
        if (!n) return;
        subtreeIds.add(n.categoryId);
        for (const c of n.children ?? []) collect(c);
      })(draggedNode);
      if (subtreeIds.has(targetParentId)) {
        alert("하위 카테고리로 이동할 수 없습니다.");
        return;
      }
    }

    const removed = removeNode(localTree, draggedId);
    if (!removed.removed) return;

    // 같은 부모 내 reorder면 index 보정
    let insertAt = targetIndex;
    if (draggedInfo.parentId === targetParentId && overIdStr.startsWith("node:")) {
      const siblingsAfterRemove = flattenWithParent(removed.next, null)
        .filter((x) => x.parentId === targetParentId)
        .map((x) => x.id);
      const overNodeId = asNumberId(overIdStr);
      if (overNodeId != null) {
        insertAt = siblingsAfterRemove.indexOf(overNodeId);
        if (insertAt < 0) insertAt = siblingsAfterRemove.length;
      }
    }

    const nextTree = insertNode(removed.next, targetParentId, insertAt, removed.removed);
    setLocalTree(nextTree);

    try {
      await reorderMut.mutateAsync(computeReorderPayload(nextTree));
    } catch (e) {
      alert(errorText(e, "정렬/레벨 변경에 실패했습니다."));
    }
  };

  const renderNode = (node: TreeNode) => {
    const isSelected = selectedId === node.categoryId;
    const code = codeMapLocal.get(node.categoryId) ?? "";
    const childIds = (node.children ?? []).map((c) => NODE_ID(c.categoryId));

    return (
      <SortableNode
        key={node.categoryId}
        node={node}
        code={code}
        selected={isSelected}
        onSelect={onSelect}
        children={
          node.children?.length ? (
            <ul className={styles.nodeChildren}>
              <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
                {node.children.map(renderNode)}
              </SortableContext>
            </ul>
          ) : null
        }
      />
    );
  };

  const handleCreateRoot = async () => {
    const name = newRootName.trim();
    if (!name) return;

    try {
      await createMut.mutateAsync({ parentId: null, name });
      setNewRootName("");
    } catch (e) {
      alert(errorText(e, "메인 카테고리 생성에 실패했습니다."));
    }
  };

  const handleCreateChild = async () => {
    if (selectedId == null) {
      alert("상위(부모) 카테고리를 먼저 선택하세요.");
      return;
    }
    const name = newChildName.trim();
    if (!name) return;

    try {
      await createMut.mutateAsync({ parentId: selectedId, name });
      setNewChildName("");
    } catch (e) {
      alert(errorText(e, "하위 카테고리 생성에 실패했습니다."));
    }
  };

  const handleRename = async () => {
    if (selectedId == null) return;
    const name = editName.trim();
    if (!name) return;

    try {
      await updateMut.mutateAsync({ categoryId: selectedId, payload: { name } });
    } catch (e) {
      alert(errorText(e, "이름 변경에 실패했습니다."));
    }
  };

  const handleSetActive = async (nextActive: boolean) => {
    if (selectedId == null || !selected) return;
    try {
      const next: CategoryActiveCode = statusToActiveCode(nextActive ? "ACTIVE" : "INACTIVE");
      await toggleMut.mutateAsync({ categoryId: selectedId, isActive: next });
    } catch (e) {
      alert(errorText(e, "활성/비활성 변경에 실패했습니다."));
    }
  };

  const handleDelete = async () => {
    if (selectedId == null) return;
    const ok = window.confirm("해당 카테고리를 삭제(soft delete)하시겠습니까?");
    if (!ok) return;

    try {
      await deleteMut.mutateAsync(selectedId);
      setSelectedId(null);
    } catch (e) {
      alert(errorText(e, "카테고리 삭제에 실패했습니다."));
    }
  };

  if (treeQuery.isLoading) return <div className={styles.wrap}>로딩 중...</div>;

  if (treeQuery.isError) {
    return (
      <div className={styles.wrap}>
        {/* ✅ 백 메시지 우선 */}
        {errorText(treeQuery.error, "카테고리 트리 조회에 실패했습니다.")}
        <button type="button" className={styles.retry} onClick={() => treeQuery.refetch()}>
          다시 시도
        </button>
      </div>
    );
  }

  const selectedActive = selected ? isActiveStatus(selected.status) : false;

  return (
    <div className={styles.layout}>
      <section className={styles.left}>
        <div className={styles.header}>
          <h2 className={styles.title}>카테고리 트리</h2>
          <button type="button" className={styles.refresh} onClick={() => treeQuery.refetch()}>
            새로고침
          </button>
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <DropZone id={ROOT_DROP_ID} label="여기로 드랍하면 루트로 이동" />
          <ul className={styles.treeRoot}>
            <SortableContext
              items={localTree.map((n) => NODE_ID(n.categoryId))}
              strategy={verticalListSortingStrategy}
            >
              {localTree.map(renderNode)}
            </SortableContext>
          </ul>
        </DndContext>
      </section>

      <section className={styles.right}>
        <h2 className={styles.title}>관리</h2>

        <div className={styles.panel}>
          {/* ✅ 메인(루트) 생성 */}
          <div className={styles.block}>
            <div className={styles.blockTitle}>메인 카테고리 생성</div>
            <div className={styles.inline}>
              <input
                className={styles.input}
                placeholder="새 메인 카테고리 이름"
                value={newRootName}
                onChange={(e) => setNewRootName(e.target.value)}
              />
              <button type="button" className={styles.btn} onClick={handleCreateRoot}>
                생성
              </button>
            </div>
          </div>

          {selectedId == null || !selected ? (
            <div className={styles.empty}>왼쪽 트리에서 카테고리를 선택하세요.</div>
          ) : (
            <>
              <div className={styles.block}>
                <div className={styles.blockTitle}>이름 변경</div>
                <div className={styles.inline}>
                  <input
                    className={styles.input}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <button type="button" className={styles.btn} onClick={handleRename}>
                    저장
                  </button>
                </div>
              </div>

              <div className={styles.block}>
                <div className={styles.blockTitle}>활성/비활성</div>

                <div className={styles.switchRow}>
                  <div
                    role="switch"
                    aria-checked={selectedActive}
                    tabIndex={0}
                    className={
                      selectedActive ? `${styles.switch} ${styles.switchOn}` : `${styles.switch} ${styles.switchOff}`
                    }
                    onClick={() => handleSetActive(!selectedActive)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSetActive(!selectedActive);
                      }
                    }}
                  >
                    <div className={styles.switchThumb} />
                    <div className={styles.switchLabels}>
                      <div className={`${styles.switchLabel} ${styles.switchLabelOff}`}>비활성</div>
                      <div className={`${styles.switchLabel} ${styles.switchLabelOn}`}>활성</div>
                    </div>
                  </div>

                  <span className={selectedActive ? styles.badgeActive : styles.badgeInactive}>
                    {selectedActive ? "Y" : "N"}
                  </span>
                </div>
              </div>

              <div className={styles.block}>
                <div className={styles.blockTitle}>하위 카테고리 생성</div>
                <div className={styles.inline}>
                  <input
                    className={styles.input}
                    placeholder="새 하위 카테고리 이름"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                  />
                  <button type="button" className={styles.btn} onClick={handleCreateChild}>
                    생성
                  </button>
                </div>
              </div>

              <div className={styles.blockDanger}>
                <button type="button" className={styles.btnDanger} onClick={handleDelete}>
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
