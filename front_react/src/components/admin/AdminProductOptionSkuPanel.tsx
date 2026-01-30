import { useEffect, useMemo, useState } from "react";

import styles from "./AdminProductOptionSkuPanel.module.css";

import type {
  AdminSkuListParams,
  AdminSkuItem,
  AdminSkuSavePayload,
  AdminOptionGroupSavePayload,
  AdminOptionValueSavePayload,
} from "@/types/admin/product";

import {
  useAdminSkus,
  useAdminSkuUpdate,
  useAdminOptionGroups,
  useAdminOptionValues,
  useAdminOptionValuesByProduct,
  useAdminOptionGroupCreate,
  useAdminOptionGroupUpdate,
  useAdminOptionGroupDelete,
  useAdminOptionGroupReorder,
  useAdminOptionValueCreate,
  useAdminOptionValueUpdate,
  useAdminOptionValueDelete,
  useAdminOptionValueReorder,
} from "@/hooks/admin/adminProduct.hook";

type Props = {
  productId: number;
};

const SKU_STATUS_OPTIONS = [
  { value: "ON_SALE", label: "판매중" },
  { value: "SOLD_OUT", label: "품절" },
  { value: "STOPPED", label: "판매중지" },
] as const;

export default function AdminProductOptionSkuPanel({ productId }: Props) {
  const [uiError, setUiError] = useState<string>("");

  const groupsQ = useAdminOptionGroups(productId);
  const groups = groupsQ.data ?? [];

  const [selectedGroupId, setSelectedGroupId] = useState<number>(0);

  const valuesQ = useAdminOptionValues(selectedGroupId);
  const values = valuesQ.data ?? [];

  const allValuesQ = useAdminOptionValuesByProduct(productId);
  const allValues = allValuesQ.data ?? [];

  const groupCreate = useAdminOptionGroupCreate(productId);
  const groupUpdate = useAdminOptionGroupUpdate(productId);
  const groupDelete = useAdminOptionGroupDelete(productId);
  const groupReorder = useAdminOptionGroupReorder(productId);

  const valueCreate = useAdminOptionValueCreate(selectedGroupId);
  const valueUpdate = useAdminOptionValueUpdate(selectedGroupId);
  const valueDelete = useAdminOptionValueDelete(selectedGroupId);
  const valueReorder = useAdminOptionValueReorder(selectedGroupId);

  const [groupForm, setGroupForm] = useState<{ name: string }>({ name: "" });

  const [groupOrder, setGroupOrder] = useState<number[]>([]);

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      const diff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (diff !== 0) return diff;
      return (a.optionGroupId ?? 0) - (b.optionGroupId ?? 0);
    });
  }, [groups]);

  useEffect(() => {
    setGroupOrder(sortedGroups.map((g) => g.optionGroupId));
  }, [sortedGroups]);

  const [valueForm, setValueForm] = useState<{ value: string; sortOrder: string }>({
    value: "",
    sortOrder: "1",
  });

  const [valueOrder, setValueOrder] = useState<number[]>([]);

  const sortedValues = useMemo(() => {
    return [...values].sort((a, b) => {
      const diff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (diff !== 0) return diff;
      return (a.optionValueId ?? 0) - (b.optionValueId ?? 0);
    });
  }, [values]);

  useEffect(() => {
    setValueOrder(sortedValues.map((v) => v.optionValueId));
  }, [sortedValues, selectedGroupId]);

  const optionValueIdToLabel = useMemo(() => {
    const map = new Map<number, string>();
    for (const it of allValues) {
      map.set(it.optionValueId, it.value);
    }
    for (const it of values) {
      map.set(it.optionValueId, it.value);
    }
    return map;
  }, [allValues, values]);

  const optionValueIdsToComboLabel = (ids?: number[]) => {
    if (!ids || ids.length === 0) return "(옵션 없음)";
    return ids
      .slice()
      .sort((a, b) => a - b)
      .map((id) => optionValueIdToLabel.get(id) ?? `#${id}`)
      .join(" / ");
  };

  const [skuPage, setSkuPage] = useState<number>(1);
  const [skuSize, setSkuSize] = useState<number>(10);
  const [skuStatus, setSkuStatus] = useState<string>("");

  const skuParams: AdminSkuListParams = useMemo(
    () => ({
      page: skuPage,
      size: skuSize,
      productId,
      status: skuStatus.trim() || undefined,
    }),
    [skuPage, skuSize, productId, skuStatus]
  );

  const skusQ = useAdminSkus(skuParams);
  const skus = skusQ.data?.list ?? [];
  const skuTotalCount = skusQ.data?.totalCount ?? 0;
  const skuTotalPages = Math.ceil((skusQ.data?.totalCount ?? 0) / skuSize);

  const skuUpdateMut = useAdminSkuUpdate();

  type SkuDraft = { price: string; stock: string; status: string };
  const [skuDraft, setSkuDraft] = useState<Record<number, SkuDraft>>({});

  const getDraft = (skuId: number, fallback: { price: number; stock: number; status: string }) => {
    const d = skuDraft[skuId];
    if (d) return d;
    return { price: String(fallback.price), stock: String(fallback.stock), status: fallback.status };
  };

  const setDraft = (skuId: number, patch: Partial<SkuDraft>, fallback?: SkuDraft) => {
    setSkuDraft((prev) => {
      const base: SkuDraft = prev[skuId] ?? fallback ?? { price: "0", stock: "0", status: "STOPPED" };
      return {
        ...prev,
        [skuId]: { ...base, ...patch },
      };
    });
  };

  const toNumberOrThrow = (v: string, label: string) => {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new Error(`${label}은(는) 숫자여야 합니다.`);
    return n;
  };

  async function onSaveSku(row: AdminSkuItem) {
    setUiError("");
    try {
      const d = getDraft(row.skuId, { price: row.price, stock: row.stock, status: row.status });
      const payload: AdminSkuSavePayload = {
        productId: row.productId,
        price: toNumberOrThrow(d.price, "가격"),
        stock: toNumberOrThrow(d.stock, "재고"),
        status: d.status,
        ...(row.optionValueIds ? { optionValueIds: row.optionValueIds } : {}),
      };
      await skuUpdateMut.mutateAsync({ skuId: row.skuId, payload });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "SKU 저장 오류");
    }
  }

  async function onCreateGroup() {
    setUiError("");
    try {
      const name = groupForm.name.trim();
      if (!name) throw new Error("그룹명은 필수입니다.");

      const maxSortOrder = sortedGroups.reduce((acc, g) => Math.max(acc, g.sortOrder ?? 0), 0);
      const payload: AdminOptionGroupSavePayload = { productId, name, sortOrder: maxSortOrder + 1 };
      await groupCreate.mutateAsync(payload);
      setGroupForm({ name: "" });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "그룹 생성 오류");
    }
  }

  const orderedGroups = useMemo(() => {
    if (groupOrder.length === 0) return sortedGroups;
    const map = new Map<number, (typeof sortedGroups)[number]>();
    for (const g of sortedGroups) map.set(g.optionGroupId, g);
    return groupOrder.map((id) => map.get(id)).filter(Boolean) as (typeof sortedGroups);
  }, [groupOrder, sortedGroups]);

  async function onSaveGroupOrder(nextOrder: number[]) {
    setUiError("");
    try {
      await groupReorder.mutateAsync({ productId, orderedGroupIds: nextOrder });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "그룹 정렬 저장 오류");
    }
  }

  async function onUpdateGroup(groupId: number, name: string, sortOrder: number) {
    setUiError("");
    try {
      const payload: AdminOptionGroupSavePayload = { productId, name, sortOrder };
      await groupUpdate.mutateAsync({ groupId, payload });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "그룹 수정 오류");
    }
  }

  async function onDeleteGroup(groupId: number) {
    setUiError("");
    try {
      const ok = window.confirm(`옵션 그룹을 삭제하시겠습니까?\n그룹 ID=${groupId}`);
      if (!ok) return;
      await groupDelete.mutateAsync(groupId);
      if (selectedGroupId === groupId) setSelectedGroupId(0);
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "그룹 삭제 오류");
    }
  }

  async function onCreateValue() {
    setUiError("");
    try {
      if (selectedGroupId <= 0) throw new Error("옵션 그룹을 먼저 선택해 주세요.");

      const value = valueForm.value.trim();
      if (!value) throw new Error("옵션 값은 필수입니다.");

      const maxSortOrder = sortedValues.reduce((acc, v) => Math.max(acc, v.sortOrder ?? 0), 0);
      const payload: AdminOptionValueSavePayload = {
        optionGroupId: selectedGroupId,
        value,
        sortOrder: maxSortOrder + 1,
      };
      await valueCreate.mutateAsync(payload);
      setValueForm({ value: "", sortOrder: "1" });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "옵션 값 생성 오류");
    }
  }

  const orderedValues = useMemo(() => {
    if (valueOrder.length === 0) return sortedValues;
    const map = new Map<number, (typeof sortedValues)[number]>();
    for (const v of sortedValues) map.set(v.optionValueId, v);
    return valueOrder.map((id) => map.get(id)).filter(Boolean) as (typeof sortedValues);
  }, [valueOrder, sortedValues]);

  async function onSaveValueOrder(nextOrder: number[]) {
    setUiError("");
    try {
      if (selectedGroupId <= 0) return;

      await valueReorder.mutateAsync({ optionGroupId: selectedGroupId, orderedValueIds: nextOrder });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "옵션 값 정렬 저장 오류");
    }
  }

  async function onUpdateValue(valueId: number, value: string, sortOrder: number) {
    setUiError("");
    try {
      if (selectedGroupId <= 0) throw new Error("옵션 그룹을 먼저 선택해 주세요.");
      const payload: AdminOptionValueSavePayload = { optionGroupId: selectedGroupId, value, sortOrder };
      await valueUpdate.mutateAsync({ valueId, payload });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "옵션 값 수정 오류");
    }
  }

  async function onDeleteValue(valueId: number) {
    setUiError("");
    try {
      const ok = window.confirm(`옵션 값을 삭제하시겠습니까?\n옵션 값 ID=${valueId}`);
      if (!ok) return;
      await valueDelete.mutateAsync(valueId);
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "옵션 값 삭제 오류");
    }
  }

  return (
    <div className={styles.wrap}>
      {uiError ? <div className={styles.errorBox}>{uiError}</div> : null}

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>옵션 그룹</div>
          </div>

          <div className={styles.formRow}>
            <input
              className={styles.input}
              value={groupForm.name}
              onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="그룹명"
            />
            <button className={styles.primaryBtn} onClick={onCreateGroup} disabled={groupCreate.isPending}>
              추가
            </button>
          </div>

          <div className={styles.list}>
            {groupsQ.isLoading ? (
              <div className={styles.loading}>불러오는 중...</div>
            ) : groups.length === 0 ? (
              <div className={styles.empty}>그룹이 없습니다.</div>
            ) : (
              orderedGroups.map((g) => (
                <div
                  key={g.optionGroupId}
                  className={`${styles.item} ${selectedGroupId === g.optionGroupId ? styles.activeItem : ""}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", String(g.optionGroupId));
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromId = Number(e.dataTransfer.getData("text/plain"));
                    const toId = g.optionGroupId;
                    if (!Number.isFinite(fromId) || fromId === toId) return;

                    const fromIdx = groupOrder.indexOf(fromId);
                    const toIdx = groupOrder.indexOf(toId);
                    if (fromIdx < 0 || toIdx < 0) return;

                    const next = [...groupOrder];
                    next.splice(fromIdx, 1);
                    next.splice(toIdx, 0, fromId);
                    setGroupOrder(next);
                    onSaveGroupOrder(next);
                  }}
                >
                  <div className={styles.itemMain} onClick={() => setSelectedGroupId(g.optionGroupId)}>
                    <div className={styles.itemTitle}>#{g.optionGroupId} {g.name}</div>
                    <div className={styles.itemSub}>정렬순서: {g.sortOrder}</div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      className={styles.smallBtn}
                      onClick={() => {
                        const name = prompt("그룹명", g.name);
                        if (name === null) return;
                        onUpdateGroup(g.optionGroupId, name.trim(), g.sortOrder);
                      }}
                      disabled={groupUpdate.isPending}
                    >
                      수정
                    </button>
                    <button className={styles.dangerBtn} onClick={() => onDeleteGroup(g.optionGroupId)} disabled={groupDelete.isPending}>
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>옵션 값</div>
            <div className={styles.cardHint}>그룹 ID: {selectedGroupId || "-"}</div>
          </div>

          <div className={styles.formRow}>
            <input
              className={styles.input}
              value={valueForm.value}
              onChange={(e) => setValueForm((p) => ({ ...p, value: e.target.value }))}
              placeholder="옵션 값"
            />
            <button className={styles.primaryBtn} onClick={onCreateValue} disabled={valueCreate.isPending}>
              추가
            </button>
          </div>

          {valuesQ.error ? (
            <div className={styles.errorBox}>{valuesQ.error instanceof Error ? valuesQ.error.message : "옵션 값 조회 오류"}</div>
          ) : null}

          <div className={styles.list}>
            {valuesQ.isLoading ? (
              <div className={styles.loading}>불러오는 중...</div>
            ) : selectedGroupId <= 0 ? (
              <div className={styles.empty}>왼쪽에서 그룹을 선택해 주세요.</div>
            ) : values.length === 0 ? (
              <div className={styles.empty}>옵션 값이 없습니다.</div>
            ) : (
              orderedValues.map((v) => (
                <div
                  key={v.optionValueId}
                  className={styles.item}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", String(v.optionValueId));
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromId = Number(e.dataTransfer.getData("text/plain"));
                    const toId = v.optionValueId;
                    if (!Number.isFinite(fromId) || fromId === toId) return;

                    const fromIdx = valueOrder.indexOf(fromId);
                    const toIdx = valueOrder.indexOf(toId);
                    if (fromIdx < 0 || toIdx < 0) return;

                    const next = [...valueOrder];
                    next.splice(fromIdx, 1);
                    next.splice(toIdx, 0, fromId);
                    setValueOrder(next);
                    onSaveValueOrder(next);
                  }}
                >
                  <div className={styles.itemMain}>
                    <div className={styles.itemTitle}>#{v.optionValueId} {v.value}</div>
                    <div className={styles.itemSub}>정렬순서: {v.sortOrder}</div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      className={styles.smallBtn}
                      onClick={() => {
                        const value = prompt("옵션 값", v.value);
                        if (value === null) return;
                        const sort = prompt("정렬순서", String(v.sortOrder));
                        if (sort === null) return;
                        const sortOrder = Number(sort);
                        if (!Number.isFinite(sortOrder)) {
                          setUiError("정렬순서는 숫자여야 합니다.");
                          return;
                        }
                        onUpdateValue(v.optionValueId, value.trim(), sortOrder);
                      }}
                      disabled={valueUpdate.isPending}
                    >
                      수정
                    </button>
                    <button className={styles.dangerBtn} onClick={() => onDeleteValue(v.optionValueId)} disabled={valueDelete.isPending}>
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={styles.sectionTitle}>SKU 목록 (옵션 조합별 가격/재고/상태)</div>

      <div className={styles.row}>
        <div>
          <div className={styles.itemSub}>상태</div>
          <input
            className={styles.input}
            value={skuStatus}
            onChange={(e) => setSkuStatus(e.target.value)}
            placeholder="ON_SALE / SOLD_OUT / STOPPED"
          />
        </div>

        <div>
          <div className={styles.itemSub}>조회 개수</div>
          <select
            className={styles.select}
            value={skuSize}
            onChange={(e) => {
              setSkuSize(Number(e.target.value));
              setSkuPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <button className={styles.secondaryBtn} onClick={() => setSkuPage(1)}>
          적용
        </button>
      </div>

      {skusQ.error ? (
        <div className={styles.errorBox}>{skusQ.error instanceof Error ? skusQ.error.message : "SKU 조회 오류"}</div>
      ) : null}

      <div className={styles.tableWrap}>
        {skusQ.isLoading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>옵션 조합</th>
                <th>SKU 코드</th>
                <th>가격</th>
                <th>재고</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {skus.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.empty}>데이터가 없습니다.</td>
                </tr>
              ) : (
                skus.map((s) => {
                  const d = getDraft(s.skuId, { price: s.price, stock: s.stock, status: s.status });
                  const fallbackDraft = { price: String(s.price), stock: String(s.stock), status: s.status };
                  return (
                    <tr key={s.skuId}>
                      <td>{optionValueIdsToComboLabel(s.optionValueIds)}</td>
                      <td>{s.skuCode}</td>
                      <td>
                        <input
                          className={styles.inputSmall}
                          value={d.price}
                          onChange={(e) => setDraft(s.skuId, { price: e.target.value }, fallbackDraft)}
                        />
                      </td>
                      <td>
                        <input
                          className={styles.inputSmall}
                          value={d.stock}
                          onChange={(e) => setDraft(s.skuId, { stock: e.target.value }, fallbackDraft)}
                        />
                      </td>
                      <td>
                        <select
                          className={styles.select}
                          value={d.status}
                          onChange={(e) => setDraft(s.skuId, { status: e.target.value }, fallbackDraft)}
                        >
                          {SKU_STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label} ({o.value})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={styles.actionsTd}>
                        <button
                          className={styles.primaryBtn}
                          onClick={() => onSaveSku(s)}
                          disabled={skuUpdateMut.isPending}
                        >
                          저장
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.pager}>
        <button
          className={styles.smallBtn}
          disabled={skuPage <= 1}
          onClick={() => setSkuPage((v) => Math.max(1, v - 1))}
        >
          이전
        </button>
        <span className={styles.pageText}>
          {skuPage} / {skuTotalPages} (총 {skuTotalCount}개)
        </span>
        <button
          className={styles.smallBtn}
          disabled={skuPage >= skuTotalPages}
          onClick={() => setSkuPage((v) => Math.min(skuTotalPages, v + 1))}
        >
          다음
        </button>
      </div>
    </div>
  );
}
