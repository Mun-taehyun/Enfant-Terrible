// src/views/admin/product/ProductDetailView.tsx
import { useEffect, useMemo, useState } from "react";
import styles from "./productsDetailView.module.css";

import type {
  AdminProductSavePayload,
  AdminSkuListParams,
  AdminSkuSavePayload,
  AdminOptionGroupSavePayload,
  AdminOptionValueSavePayload,
} from "@/types/admin/product";

import {
  useAdminProductDetail,
  useAdminProductUpdate,
  useAdminProductDelete,
  useAdminSkus,
  useAdminSkuUpdate,
  useAdminOptionGroups,
  useAdminOptionValues,
  useAdminOptionGroupCreate,
  useAdminOptionGroupUpdate,
  useAdminOptionGroupDelete,
  useAdminOptionValueCreate,
  useAdminOptionValueUpdate,
  useAdminOptionValueDelete,
} from "@/hooks/admin/adminProduct.hook";

type Props = {
  productId: number;
  onClose: () => void;
};

type TabKey = "PRODUCT" | "SKU" | "OPTION";

type ProductFormState = {
  productCode: string;
  categoryId: string;
  name: string;
  basePrice: string;
  status: string;
  thumbnailFileId: string; // DTO 존재(옵션)
};

function toNumberOrThrow(v: string, label: string): number {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`${label}은(는) 숫자여야 합니다.`);
  return n;
}

function toOptionalNumber(v: string): number | undefined | null {
  const s = v.trim();
  if (!s) return undefined;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

function toOptionalNumberArray(csv: string): number[] | undefined | null {
  const s = csv.trim();
  if (!s) return undefined;
  const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n))) return null;
  return nums;
}

export default function ProductDetailView({ productId, onClose }: Props) {
  const [tab, setTab] = useState<TabKey>("PRODUCT");
  const [uiError, setUiError] = useState<string>("");

  // ====== 상품 상세 ======
  const detailQ = useAdminProductDetail(productId);
  const updateMut = useAdminProductUpdate();
  const deleteMut = useAdminProductDelete();

  const [form, setForm] = useState<ProductFormState>({
    productCode: "",
    categoryId: "",
    name: "",
    basePrice: "",
    status: "",
    thumbnailFileId: "",
  });

  // 상세 로드되면 폼에 반영
  useEffect(() => {
    const p = detailQ.data;
    if (!p) return;
    setForm({
      productCode: p.productCode ?? "",
      categoryId: String(p.categoryId ?? ""),
      name: p.name ?? "",
      basePrice: String(p.basePrice ?? ""),
      status: String(p.status ?? ""),
      thumbnailFileId: "", // 상세에 이 값이 온다는 보장이 현재 없어서 빈 값 유지
    });
  }, [detailQ.data]);

  async function onSaveProduct() {
    setUiError("");
    try {
      const thumb = toOptionalNumber(form.thumbnailFileId);
      if (thumb === null) throw new Error("thumbnailFileId는 숫자여야 합니다.");

      const payload: AdminProductSavePayload = {
        productCode: form.productCode.trim(),
        categoryId: toNumberOrThrow(form.categoryId, "categoryId"),
        name: form.name.trim(),
        basePrice: toNumberOrThrow(form.basePrice, "basePrice"),
        status: form.status.trim(),
        thumbnailFileId: thumb,
      };

      if (!payload.productCode) throw new Error("productCode는 필수입니다.");
      if (!payload.name) throw new Error("name은 필수입니다.");
      if (!payload.status) throw new Error("status는 필수입니다.");

      await updateMut.mutateAsync({ productId, payload });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    }
  }

  async function onDeleteProduct() {
    setUiError("");
    try {
      const ok = window.confirm(`상품을 삭제(soft delete)하시겠습니까?\nproductId=${productId}`);
      if (!ok) return;
      await deleteMut.mutateAsync(productId);
      onClose();
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "삭제 중 오류가 발생했습니다.");
    }
  }

  // ====== SKU ======
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
  const skuUpdateMut = useAdminSkuUpdate();

  async function onEditSku(row: { skuId: number; productId: number; price: number; stock: number; status: string; optionValueIds?: number[] }) {
    setUiError("");
    try {
      // DTO 필수: productId, price, stock, status (PUT body에 productId가 반드시 필요)
      const pid = prompt("productId (필수)", String(row.productId));
      if (pid === null) return;

      const p = prompt("price (필수)", String(row.price));
      if (p === null) return;

      const s = prompt("stock (필수)", String(row.stock));
      if (s === null) return;

      const st = prompt("status (필수: ON_SALE | SOLD_OUT | STOPPED)", String(row.status));
      if (st === null) return;

      const currentOpt = row.optionValueIds?.join(",") ?? "";
      const optCsv = prompt("optionValueIds (optional, comma separated)", currentOpt);
      if (optCsv === null) return;

      const optionValueIds = toOptionalNumberArray(optCsv);
      if (optionValueIds === null) throw new Error("optionValueIds는 쉼표로 구분된 숫자 목록이어야 합니다.");

      const payload: AdminSkuSavePayload = {
        productId: toNumberOrThrow(pid, "productId"),
        price: toNumberOrThrow(p, "price"),
        stock: toNumberOrThrow(s, "stock"),
        status: st.trim(),
        ...(optionValueIds ? { optionValueIds } : {}),
      };

      if (!payload.status) throw new Error("status는 필수입니다.");

      await skuUpdateMut.mutateAsync({ skuId: row.skuId, payload });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "SKU 수정 중 오류가 발생했습니다.");
    }
  }

  // ====== OPTION ======
  const groupsQ = useAdminOptionGroups(productId);
  const [selectedGroupId, setSelectedGroupId] = useState<number>(0);
  const valuesQ = useAdminOptionValues(selectedGroupId);

  const groupCreate = useAdminOptionGroupCreate(productId);
  const groupUpdate = useAdminOptionGroupUpdate(productId);
  const groupDelete = useAdminOptionGroupDelete(productId);

  const valueCreate = useAdminOptionValueCreate(selectedGroupId);
  const valueUpdate = useAdminOptionValueUpdate(selectedGroupId);
  const valueDelete = useAdminOptionValueDelete(selectedGroupId);

  const [groupForm, setGroupForm] = useState<{ name: string; sortOrder: string }>({ name: "", sortOrder: "1" });
  const [valueForm, setValueForm] = useState<{ value: string; sortOrder: string }>({ value: "", sortOrder: "1" });

  async function onCreateGroup() {
    setUiError("");
    try {
      const name = groupForm.name.trim();
      const sortOrder = Number(groupForm.sortOrder);
      if (!name) throw new Error("그룹명은 필수입니다.");
      if (!Number.isFinite(sortOrder)) throw new Error("sortOrder는 숫자여야 합니다.");

      const payload: AdminOptionGroupSavePayload = { productId, name, sortOrder };
      await groupCreate.mutateAsync(payload);
      setGroupForm({ name: "", sortOrder: "1" });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "그룹 생성 오류");
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
      const ok = window.confirm(`옵션 그룹을 삭제하시겠습니까?\ngroupId=${groupId}`);
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
      const sortOrder = Number(valueForm.sortOrder);

      if (!value) throw new Error("옵션 값은 필수입니다.");
      if (!Number.isFinite(sortOrder)) throw new Error("sortOrder는 숫자여야 합니다.");

      const payload: AdminOptionValueSavePayload = { optionGroupId: selectedGroupId, value, sortOrder };
      await valueCreate.mutateAsync(payload);
      setValueForm({ value: "", sortOrder: "1" });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "옵션 값 생성 오류");
    }
  }

  async function onUpdateValue(valueId: number, value: string, sortOrder: number) {
    setUiError("");
    try {
      if (selectedGroupId <= 0) throw new Error("옵션 그룹이 유효하지 않습니다.");
      const payload: AdminOptionValueSavePayload = { optionGroupId: selectedGroupId, value, sortOrder };
      await valueUpdate.mutateAsync({ valueId, payload });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "옵션 값 수정 오류");
    }
  }

  async function onDeleteValue(valueId: number) {
    setUiError("");
    try {
      const ok = window.confirm(`옵션 값을 삭제하시겠습니까?\nvalueId=${valueId}`);
      if (!ok) return;
      await valueDelete.mutateAsync(valueId);
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "옵션 값 삭제 오류");
    }
  }

  const product = detailQ.data;
  const skus = skusQ.data?.content ?? [];
  const skuTotalPages = skusQ.data?.totalPages ?? 1;
  const groups = groupsQ.data ?? [];
  const values = valuesQ.data ?? [];

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <div className={styles.topTitle}>
          상품 상세 패널 (productId: {productId})
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          닫기
        </button>
      </div>

      {uiError ? <div className={styles.errorBox}>{uiError}</div> : null}

      <div className={styles.tabs}>
        <button className={`${styles.tabBtn} ${tab === "PRODUCT" ? styles.active : ""}`} onClick={() => setTab("PRODUCT")}>
          상품
        </button>
        <button className={`${styles.tabBtn} ${tab === "SKU" ? styles.active : ""}`} onClick={() => setTab("SKU")}>
          SKU
        </button>
        <button className={`${styles.tabBtn} ${tab === "OPTION" ? styles.active : ""}`} onClick={() => setTab("OPTION")}>
          옵션
        </button>
      </div>

      {/* ===================== 상품 탭 ===================== */}
      {tab === "PRODUCT" ? (
        <div className={styles.section}>
          {detailQ.isLoading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : detailQ.error ? (
            <div className={styles.errorBox}>{detailQ.error instanceof Error ? detailQ.error.message : "상세 조회 오류"}</div>
          ) : !product ? (
            <div className={styles.empty}>상세 데이터가 없습니다.</div>
          ) : (
            <>
              <div className={styles.formGrid}>
                <label className={styles.label}>
                  productCode
                  <input className={styles.input} value={form.productCode} onChange={(e) => setForm((p: ProductFormState) => ({ ...p, productCode: e.target.value }))} />
                </label>

                <label className={styles.label}>
                  categoryId
                  <input className={styles.input} value={form.categoryId} onChange={(e) => setForm((p: ProductFormState) => ({ ...p, categoryId: e.target.value }))} />
                </label>

                <label className={styles.label}>
                  name
                  <input className={styles.input} value={form.name} onChange={(e) => setForm((p: ProductFormState) => ({ ...p, name: e.target.value }))} />
                </label>

                <label className={styles.label}>
                  basePrice
                  <input className={styles.input} value={form.basePrice} onChange={(e) => setForm((p: ProductFormState) => ({ ...p, basePrice: e.target.value }))} />
                </label>

                <label className={styles.label}>
                  status
                  <input className={styles.input} value={form.status} onChange={(e) => setForm((p: ProductFormState) => ({ ...p, status: e.target.value }))} />
                </label>

                <label className={styles.label}>
                  thumbnailFileId (optional)
                  <input className={styles.input} value={form.thumbnailFileId} onChange={(e) => setForm((p: ProductFormState) => ({ ...p, thumbnailFileId: e.target.value }))} />
                </label>
              </div>

              <div className={styles.actions}>
                <button className={styles.primaryBtn} onClick={onSaveProduct} disabled={updateMut.isPending}>
                  저장
                </button>
                <button className={styles.dangerBtn} onClick={onDeleteProduct} disabled={deleteMut.isPending}>
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* ===================== SKU 탭 ===================== */}
      {tab === "SKU" ? (
        <div className={styles.section}>
          <div className={styles.row}>
            <label className={styles.label}>
              status
              <input className={styles.input} value={skuStatus} onChange={(e) => setSkuStatus(e.target.value)} placeholder="ON_SALE / SOLD_OUT / STOPPED" />
            </label>

            <label className={styles.labelSmall}>
              size
              <select className={styles.select} value={skuSize} onChange={(e) => setSkuSize(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>

            <button className={styles.secondaryBtn} onClick={() => setSkuPage(1)}>
              적용
            </button>
          </div>

          {skusQ.error ? <div className={styles.errorBox}>{skusQ.error instanceof Error ? skusQ.error.message : "SKU 조회 오류"}</div> : null}

          <div className={styles.tableWrap}>
            {skusQ.isLoading ? (
              <div className={styles.loading}>불러오는 중...</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>skuId</th>
                    <th>skuCode</th>
                    <th>price</th>
                    <th>stock</th>
                    <th>status</th>
                    <th>createdAt</th>
                    <th>actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skus.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.empty}>
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    skus.map((s) => (
                      <tr key={s.skuId}>
                        <td>{s.skuId}</td>
                        <td>{s.skuCode}</td>
                        <td>{s.price}</td>
                        <td>{s.stock}</td>
                        <td>{s.status}</td>
                        <td>{s.createdAt}</td>
                        <td className={styles.actionsTd}>
                          <button className={styles.smallBtn} onClick={() => onEditSku(s)} disabled={skuUpdateMut.isPending}>
                            수정
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.pager}>
            <button className={styles.smallBtn} disabled={skuPage <= 1} onClick={() => setSkuPage((v: number) => Math.max(1, v - 1))}>
              이전
            </button>
            <span className={styles.pageText}>
              {skuPage} / {skuTotalPages}
            </span>
            <button className={styles.smallBtn} disabled={skuPage >= skuTotalPages} onClick={() => setSkuPage((v: number) => Math.min(skuTotalPages, v + 1))}>
              다음
            </button>
          </div>
        </div>
      ) : null}

      {/* ===================== 옵션 탭 ===================== */}
      {tab === "OPTION" ? (
        <div className={styles.section}>
          {groupsQ.error ? <div className={styles.errorBox}>{groupsQ.error instanceof Error ? groupsQ.error.message : "옵션 그룹 조회 오류"}</div> : null}

          <div className={styles.optionGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>옵션 그룹</div>
              </div>

              <div className={styles.formRow}>
                <input className={styles.input} value={groupForm.name} onChange={(e) => setGroupForm((p: { name: string; sortOrder: string }) => ({ ...p, name: e.target.value }))} placeholder="그룹명" />
                <input className={styles.inputSmall} value={groupForm.sortOrder} onChange={(e) => setGroupForm((p: { name: string; sortOrder: string }) => ({ ...p, sortOrder: e.target.value }))} placeholder="sort" />
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
                  groups.map((g) => (
                    <div key={g.optionGroupId} className={`${styles.item} ${selectedGroupId === g.optionGroupId ? styles.activeItem : ""}`}>
                      <button className={styles.itemMain} onClick={() => setSelectedGroupId(g.optionGroupId)}>
                        <div className={styles.itemTitle}>
                          #{g.optionGroupId} {g.name}
                        </div>
                        <div className={styles.itemSub}>sortOrder: {g.sortOrder}</div>
                      </button>

                      <div className={styles.itemActions}>
                        <button
                          className={styles.smallBtn}
                          onClick={() => {
                            const name = prompt("그룹명", g.name);
                            if (name === null) return;
                            const sort = prompt("sortOrder", String(g.sortOrder));
                            if (sort === null) return;
                            const sortOrder = Number(sort);
                            if (!Number.isFinite(sortOrder)) {
                              setUiError("sortOrder는 숫자여야 합니다.");
                              return;
                            }
                            onUpdateGroup(g.optionGroupId, name.trim(), sortOrder);
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
                <div className={styles.cardHint}>groupId: {selectedGroupId || "-"}</div>
              </div>

              <div className={styles.formRow}>
                <input className={styles.input} value={valueForm.value} onChange={(e) => setValueForm((p: { value: string; sortOrder: string }) => ({ ...p, value: e.target.value }))} placeholder="옵션 값" />
                <input className={styles.inputSmall} value={valueForm.sortOrder} onChange={(e) => setValueForm((p: { value: string; sortOrder: string }) => ({ ...p, sortOrder: e.target.value }))} placeholder="sort" />
                <button className={styles.primaryBtn} onClick={onCreateValue} disabled={valueCreate.isPending}>
                  추가
                </button>
              </div>

              {valuesQ.error ? <div className={styles.errorBox}>{valuesQ.error instanceof Error ? valuesQ.error.message : "옵션 값 조회 오류"}</div> : null}

              <div className={styles.list}>
                {valuesQ.isLoading ? (
                  <div className={styles.loading}>불러오는 중...</div>
                ) : selectedGroupId <= 0 ? (
                  <div className={styles.empty}>왼쪽에서 그룹을 선택해 주세요.</div>
                ) : values.length === 0 ? (
                  <div className={styles.empty}>옵션 값이 없습니다.</div>
                ) : (
                  values.map((v) => (
                    <div key={v.optionValueId} className={styles.item}>
                      <div className={styles.itemMainStatic}>
                        <div className={styles.itemTitle}>
                          #{v.optionValueId} {v.value}
                        </div>
                        <div className={styles.itemSub}>sortOrder: {v.sortOrder}</div>
                      </div>

                      <div className={styles.itemActions}>
                        <button
                          className={styles.smallBtn}
                          onClick={() => {
                            const value = prompt("옵션 값", v.value);
                            if (value === null) return;
                            const sort = prompt("sortOrder", String(v.sortOrder));
                            if (sort === null) return;

                            const sortOrder = Number(sort);
                            if (!Number.isFinite(sortOrder)) {
                              setUiError("sortOrder는 숫자여야 합니다.");
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
        </div>
      ) : null}
    </div>
  );
}
