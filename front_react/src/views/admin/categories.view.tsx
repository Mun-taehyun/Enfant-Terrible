// src/views/admin/categories/categories.view.tsx

import { useMemo, useState } from "react";
import styles from "./categories.view.module.css";

import type { AdminCategory } from "@/types/admin/category";
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

// ✅ enum 확정에 따른 고정 규칙
type ActiveCode = "Y" | "N";
const isActiveStatus = (status: AdminCategory["status"]) => status === "ACTIVE";
const nextActiveCode = (status: AdminCategory["status"]): ActiveCode => (isActiveStatus(status) ? "N" : "Y");

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
    sortMut,
    moveMut,
    deleteMut,
  } = useAdminCategoriesPage();

  // ✅ 루트 생성
  const [newRootName, setNewRootName] = useState("");

  // ✅ 하위 생성
  const [newChildName, setNewChildName] = useState("");

  const [editName, setEditName] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [moveParentId, setMoveParentId] = useState<number | "null">("null");

  const codeMap = useMemo(() => buildCodeMap(tree), [tree]);

  const onSelect = (node: AdminCategory) => {
    setSelectedId(node.categoryId);
    setEditName(node.name);
    setEditSortOrder(node.sortOrder);
    setMoveParentId(node.parentId === null ? "null" : node.parentId);
  };

  const renderNode = (node: AdminCategory) => {
    const active = isActiveStatus(node.status);
    const isSelected = selectedId === node.categoryId;
    const code = codeMap.get(node.categoryId) ?? "";

    return (
      <li key={node.categoryId} className={styles.nodeItem}>
        <button
          type="button"
          className={isSelected ? `${styles.nodeBtn} ${styles.nodeBtnActive}` : styles.nodeBtn}
          onClick={() => onSelect(node)}
        >
          <span className={styles.nodeName}>
            <span className={styles.nodeMeta}>{code}</span> {node.name}
          </span>
          <span className={active ? styles.badgeActive : styles.badgeInactive}>{active ? "Y" : "N"}</span>
        </button>

        {node.children?.length ? <ul className={styles.nodeChildren}>{node.children.map(renderNode)}</ul> : null}
      </li>
    );
  };

  const handleCreateRoot = async () => {
    const name = newRootName.trim();
    if (!name) return;

    await createMut.mutateAsync({ parentId: null, name });
    setNewRootName("");
  };

  const handleCreateChild = async () => {
    if (!selectedId) {
      alert("부모(상위) 카테고리를 먼저 선택하세요.");
      return;
    }
    const name = newChildName.trim();
    if (!name) return;

    await createMut.mutateAsync({ parentId: selectedId, name });
    setNewChildName("");
  };

  const handleRename = async () => {
    if (!selectedId) return;
    const name = editName.trim();
    if (!name) return;

    await updateMut.mutateAsync({ categoryId: selectedId, payload: { name } });
  };

  const handleToggleActive = async () => {
    if (!selectedId || !selected) return;

    // ✅ status(ACTIVE/INACTIVE)로 판단 → 요청은 Y/N(code)
    const next: ActiveCode = nextActiveCode(selected.status);
    await toggleMut.mutateAsync({ categoryId: selectedId, isActive: next });
  };

  const handleSortOrder = async () => {
    if (!selectedId) return;
    await sortMut.mutateAsync({ categoryId: selectedId, sortOrder: Number(editSortOrder) });
  };

  const handleMoveParent = async () => {
    if (!selectedId) return;

    const pid = moveParentId === "null" ? null : Number(moveParentId);

    if (pid !== null && pid === selectedId) {
      alert("자기 자신을 부모로 지정할 수 없습니다.");
      return;
    }

    await moveMut.mutateAsync({ categoryId: selectedId, parentId: pid });
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const ok = window.confirm("해당 카테고리를 삭제(soft delete)하시겠습니까?");
    if (!ok) return;

    await deleteMut.mutateAsync(selectedId);
    setSelectedId(null);
  };

  if (treeQuery.isLoading) return <div className={styles.wrap}>로딩 중...</div>;
  if (treeQuery.isError)
    return (
      <div className={styles.wrap}>
        카테고리 트리 조회에 실패했습니다.
        <button type="button" className={styles.retry} onClick={() => treeQuery.refetch()}>
          다시 시도
        </button>
      </div>
    );

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

        <ul className={styles.treeRoot}>{tree.map(renderNode)}</ul>
      </section>

      <section className={styles.right}>
        <h2 className={styles.title}>관리</h2>

        <div className={styles.panel}>
          {/* ✅ 메인(루트) 생성 */}
          <div className={styles.block}>
            <div className={styles.blockTitle}>메인(루트) 카테고리 생성</div>
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

          {!selectedId || !selected ? (
            <div className={styles.empty}>왼쪽 트리에서 카테고리를 선택하세요.</div>
          ) : (
            <>
              <div className={styles.block}>
                <div className={styles.blockTitle}>이름 변경</div>
                <div className={styles.inline}>
                  <input className={styles.input} value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <button type="button" className={styles.btn} onClick={handleRename}>
                    저장
                  </button>
                </div>
              </div>

              <div className={styles.block}>
                <div className={styles.blockTitle}>활성/비활성</div>

                <div className={styles.inlineRight}>
                  <button type="button" className={styles.btn} onClick={handleToggleActive}>
                    변경
                  </button>

                  <span className={styles.statusText}>{selectedActive ? "활성" : "비활성"}</span>

                  <span className={selectedActive ? styles.badgeActive : styles.badgeInactive}>
                    {selectedActive ? "Y" : "N"}
                  </span>
                </div>
              </div>

              <div className={styles.block}>
                <div className={styles.blockTitle}>정렬 순서 변경</div>
                <div className={styles.inline}>
                  <input
                    className={styles.input}
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(Number(e.target.value))}
                  />
                  <button type="button" className={styles.btn} onClick={handleSortOrder}>
                    적용
                  </button>
                </div>
              </div>

              <div className={styles.block}>
                <div className={styles.blockTitle}>부모 변경(이동)</div>
                <div className={styles.inline}>
                  <select
                    className={styles.select}
                    value={moveParentId}
                    onChange={(e) => setMoveParentId(e.target.value === "null" ? "null" : Number(e.target.value))}
                  >
                    <option value="null">루트(null)</option>
                    {flat
                      .filter((c) => c.categoryId !== selectedId)
                      .map((c) => (
                        <option key={c.categoryId} value={c.categoryId}>
                          {codeMap.get(c.categoryId) ?? ""} {c.name}
                        </option>
                      ))}
                  </select>
                  <button type="button" className={styles.btn} onClick={handleMoveParent}>
                    이동
                  </button>
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
                  삭제(soft delete)
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
