// src/views/admin/product/ProductDetailView.tsx
// ✅ 기존 PRODUCT/SKU/OPTION 탭 + DISCOUNT 탭 추가(상품 할인 CRUD)

import { useEffect, useMemo, useState } from "react";
import styles from "./productsDetailView.module.css";

import type {
  AdminProductSavePayload,
  AdminSkuListParams,
  AdminSkuSavePayload,
  AdminOptionGroupSavePayload,
  AdminOptionValueSavePayload,
} from "@/types/admin/product";

import type {
  AdminProductDiscountSavePayload,
  AdminProductDiscountItem,
} from "@/types/admin/discount";

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

import {
  useAdminProductDiscounts,
  useAdminProductDiscountCreate,
  useAdminProductDiscountUpdate,
  useAdminProductDiscountDelete,
} from "@/hooks/admin/adminDiscount.hook";

type Props = {
  productId: number;
  onClose: () => void;
};

type TabKey = "PRODUCT" | "SKU" | "OPTION" | "DISCOUNT";

type ProductFormState = {
  productCode: string;
  categoryId: string;
  name: string;
  basePrice: string;
  status: string;
  thumbnailFileId: string;
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

function toOptionalDateTimeLocalString(v: string): string | null | undefined {
  // input[type=datetime-local]는 "YYYY-MM-DDTHH:mm" 형태
  // 백엔드 LocalDateTime은 보통 "YYYY-MM-DDTHH:mm:ss"도 가능하지만,
  // mock/프론트에서는 문자열 그대로 전달/저장 가능하도록 처리합니다.
  const s = v.trim();
  if (!s) return undefined;
  return s;
}

export default function ProductDetailView({ productId, onClose }: Props) {
  const [tab, setTab] = useState<TabKey>("PRODUCT");
  const [uiError, setUiError] = useState<string>("");

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

  useEffect(() => {
    const p = detailQ.data;
    if (!p) return;
    setForm({
      productCode: p.productCode ?? "",
      categoryId: String(p.categoryId ?? ""),
      name: p.name ?? "",
      basePrice: String(p.basePrice ?? ""),
      status: String(p.status ?? ""),
      thumbnailFileId: "",
    });
  }, [detailQ.data]);

  async function onSaveProduct() {
    setUiError("");
    try {
      const thumb = toOptionalNumber(form.thumbnailFileId);
      if (thumb === null) throw new Error("썸네일 파일 ID는 숫자여야 합니다.");

      const payload: AdminProductSavePayload = {
        productCode: form.productCode.trim(),
        categoryId: toNumberOrThrow(form.categoryId, "카테고리 ID"),
        name: form.name.trim(),
        basePrice: toNumberOrThrow(form.basePrice, "기본가"),
        status: form.status.trim(),
        thumbnailFileId: thumb,
      };

      if (!payload.productCode) throw new Error("상품코드는 필수입니다.");
      if (!payload.name) throw new Error("상품명은 필수입니다.");
      if (!payload.status) throw new Error("판매상태는 필수입니다.");

      await updateMut.mutateAsync({ productId, payload });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    }
  }

  async function onDeleteProduct() {
    setUiError("");
    try {
      const ok = window.confirm(`상품을 삭제(soft delete)하시겠습니까?\n상품 ID=${productId}`);
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
      const pid = prompt("상품 ID (필수)", String(row.productId));
      if (pid === null) return;

      const p = prompt("가격 (필수)", String(row.price));
      if (p === null) return;

      const s = prompt("재고 (필수)", String(row.stock));
      if (s === null) return;

      const st = prompt("상태 (필수: ON_SALE | SOLD_OUT | STOPPED)", String(row.status));
      if (st === null) return;

      const currentOpt = row.optionValueIds?.join(",") ?? "";
      const optCsv = prompt("옵션 값 ID 목록 (선택, 쉼표로 구분)", currentOpt);
      if (optCsv === null) return;

      const optionValueIds = toOptionalNumberArray(optCsv);
      if (optionValueIds === null) throw new Error("옵션 값 ID 목록은 쉼표로 구분된 숫자 목록이어야 합니다.");

      const payload: AdminSkuSavePayload = {
        productId: toNumberOrThrow(pid, "상품 ID"),
        price: toNumberOrThrow(p, "가격"),
        stock: toNumberOrThrow(s, "재고"),
        status: st.trim(),
        ...(optionValueIds ? { optionValueIds } : {}),
      };

      if (!payload.status) throw new Error("상태는 필수입니다.");

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
      if (!Number.isFinite(sortOrder)) throw new Error("정렬순서는 숫자여야 합니다.");

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
      if (!Number.isFinite(sortOrder)) throw new Error("정렬순서는 숫자여야 합니다.");

      const payload: AdminOptionValueSavePayload = {
        optionGroupId: selectedGroupId,
        value,
        sortOrder,
      };
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

  // ====== DISCOUNT ======
  const discountsQ = useAdminProductDiscounts(productId);
  const discountCreate = useAdminProductDiscountCreate(productId);
  const discountUpdate = useAdminProductDiscountUpdate(productId);
  const discountDelete = useAdminProductDiscountDelete(productId);

  const [discountForm, setDiscountForm] = useState<{
    discountValue: string;
    discountType: string;
    startAt: string;
    endAt: string;
  }>({
    discountValue: "",
    discountType: "",
    startAt: "",
    endAt: "",
  });

  async function onCreateDiscount() {
    setUiError("");
    try {
      const discountValue = Number(discountForm.discountValue);
      if (!Number.isFinite(discountValue)) throw new Error("discountValue는 숫자여야 합니다.");
      const discountType = discountForm.discountType.trim();
      if (!discountType) throw new Error("discountType은 필수입니다.");

      const payload: AdminProductDiscountSavePayload = {
        productId,
        discountValue,
        discountType,
        startAt: toOptionalDateTimeLocalString(discountForm.startAt),
        endAt: toOptionalDateTimeLocalString(discountForm.endAt),
      };

      await discountCreate.mutateAsync(payload);
      setDiscountForm({ discountValue: "", discountType: "", startAt: "", endAt: "" });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "할인 등록 오류");
    }
  }

  async function onEditDiscount(row: AdminProductDiscountItem) {
    setUiError("");
    try {
      const v = prompt("discountValue (필수)", String(row.discountValue));
      if (v === null) return;

      const t = prompt("discountType (필수)", String(row.discountType));
      if (t === null) return;

      const s = prompt("startAt (선택, 예: 2026-01-21T10:30)", String(row.startAt ?? ""));
      if (s === null) return;

      const e = prompt("endAt (선택, 예: 2026-01-21T23:59)", String(row.endAt ?? ""));
      if (e === null) return;

      const discountValue = Number(v);
      if (!Number.isFinite(discountValue)) throw new Error("discountValue는 숫자여야 합니다.");
      const discountType = t.trim();
      if (!discountType) throw new Error("discountType은 필수입니다.");

      const payload: AdminProductDiscountSavePayload = {
        productId,
        discountValue,
        discountType,
        startAt: s.trim() ? s.trim() : null,
        endAt: e.trim() ? e.trim() : null,
      };

      await discountUpdate.mutateAsync({ discountId: row.discountId, payload });
    } catch (err) {
      setUiError(err instanceof Error ? err.message : "할인 수정 오류");
    }
  }

  async function onDeleteDiscount(discountId: number) {
    setUiError("");
    try {
      const ok = window.confirm(`상품 할인을 삭제하시겠습니까?\ndiscountId=${discountId}`);
      if (!ok) return;
      await discountDelete.mutateAsync(discountId);
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "할인 삭제 오류");
    }
  }

  const product = detailQ.data;

  // ✅ AdminPageResponse 규격으로 맞춤
  const skus = skusQ.data?.list ?? [];
  const skuTotalCount = skusQ.data?.totalCount ?? 0;
  const skuTotalPages = Math.ceil((skusQ.data?.totalCount ?? 0) / skuSize);

  const groups = groupsQ.data ?? [];
  const values = valuesQ.data ?? [];

  const discounts = discountsQ.data ?? [];

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <div className={styles.topTitle}>상품 상세 패널 (상품 ID: {productId})</div>
        <button className={styles.closeBtn} onClick={onClose}>닫기</button>
      </div>

      {uiError ? <div className={styles.errorBox}>{uiError}</div> : null}

      <div className={styles.tabs}>
        <button className={`${styles.tabBtn} ${tab === "PRODUCT" ? styles.active : ""}`} onClick={() => setTab("PRODUCT")}>상품</button>
        <button className={`${styles.tabBtn} ${tab === "SKU" ? styles.active : ""}`} onClick={() => setTab("SKU")}>SKU</button>
        <button className={`${styles.tabBtn} ${tab === "OPTION" ? styles.active : ""}`} onClick={() => setTab("OPTION")}>옵션</button>
        <button className={`${styles.tabBtn} ${tab === "DISCOUNT" ? styles.active : ""}`} onClick={() => setTab("DISCOUNT")}>할인</button>
      </div>

      {/* 상품 탭 */}
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
                  상품코드
                  <input className={styles.input} value={form.productCode} onChange={(e) => setForm((p) => ({ ...p, productCode: e.target.value }))} />
                </label>

                <label className={styles.label}>
                  카테고리 ID
                  <input className={styles.input} value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))} />
                </label>

                <label className={styles.label}>
                  상품명
                  <input className={styles.input} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </label>

                <label className={styles.label}>
                  기본가
                  <input className={styles.input} value={form.basePrice} onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))} />
                </label>

                <label className={styles.label}>
                  판매상태
                  <input className={styles.input} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} />
                </label>

                <label className={styles.label}>
                  썸네일 파일 ID (선택)
                  <input className={styles.input} value={form.thumbnailFileId} onChange={(e) => setForm((p) => ({ ...p, thumbnailFileId: e.target.value }))} />
                </label>
              </div>

              <div className={styles.actions}>
                <button className={styles.primaryBtn} onClick={onSaveProduct} disabled={updateMut.isPending}>저장</button>
                <button className={styles.dangerBtn} onClick={onDeleteProduct} disabled={deleteMut.isPending}>삭제</button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* SKU 탭 */}
      {tab === "SKU" ? (
        <div className={styles.section}>
          <div className={styles.row}>
            <label className={styles.label}>
              상태
              <input className={styles.input} value={skuStatus} onChange={(e) => setSkuStatus(e.target.value)} placeholder="ON_SALE / SOLD_OUT / STOPPED" />
            </label>

            <label className={styles.labelSmall}>
              조회 개수
              <select className={styles.select} value={skuSize} onChange={(e) => { setSkuSize(Number(e.target.value)); setSkuPage(1); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>

            <button className={styles.secondaryBtn} onClick={() => setSkuPage(1)}>적용</button>
          </div>

          {skusQ.error ? <div className={styles.errorBox}>{skusQ.error instanceof Error ? skusQ.error.message : "SKU 조회 오류"}</div> : null}

          <div className={styles.tableWrap}>
            {skusQ.isLoading ? (
              <div className={styles.loading}>불러오는 중...</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>SKU ID</th>
                    <th>SKU 코드</th>
                    <th>가격</th>
                    <th>재고</th>
                    <th>상태</th>
                    <th>생성일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {skus.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.empty}>데이터가 없습니다.</td>
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
                          <button className={styles.smallBtn} onClick={() => onEditSku(s)} disabled={skuUpdateMut.isPending}>수정</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.pager}>
            <button className={styles.smallBtn} disabled={skuPage <= 1} onClick={() => setSkuPage((v) => Math.max(1, v - 1))}>이전</button>
            <span className={styles.pageText}>{skuPage} / {skuTotalPages} (총 {skuTotalCount}개)</span>
            <button className={styles.smallBtn} disabled={skuPage >= skuTotalPages} onClick={() => setSkuPage((v) => Math.min(skuTotalPages, v + 1))}>다음</button>
          </div>
        </div>
      ) : null}

      {/* 옵션 탭 */}
      {tab === "OPTION" ? (
        <div className={styles.section}>
          <div className={styles.optionGrid}>
            {/* 옵션 그룹 */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>옵션 그룹</div>
              </div>

              <div className={styles.formRow}>
                <input className={styles.input} value={groupForm.name} onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))} placeholder="그룹명" />
                <input className={styles.inputSmall} value={groupForm.sortOrder} onChange={(e) => setGroupForm((p) => ({ ...p, sortOrder: e.target.value }))} placeholder="정렬순서" />
                <button className={styles.primaryBtn} onClick={onCreateGroup} disabled={groupCreate.isPending}>추가</button>
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
                        <div className={styles.itemTitle}>#{g.optionGroupId} {g.name}</div>
                        <div className={styles.itemSub}>정렬순서: {g.sortOrder}</div>
                      </button>

                      <div className={styles.itemActions}>
                        <button
                          className={styles.smallBtn}
                          onClick={() => {
                            const name = prompt("그룹명", g.name);
                            if (name === null) return;
                            const sort = prompt("정렬순서", String(g.sortOrder));
                            if (sort === null) return;
                            const sortOrder = Number(sort);
                            if (!Number.isFinite(sortOrder)) {
                              setUiError("정렬순서는 숫자여야 합니다.");
                              return;
                            }
                            onUpdateGroup(g.optionGroupId, name.trim(), sortOrder);
                          }}
                          disabled={groupUpdate.isPending}
                        >
                          수정
                        </button>
                        <button className={styles.dangerBtn} onClick={() => onDeleteGroup(g.optionGroupId)} disabled={groupDelete.isPending}>삭제</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 옵션 값 */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>옵션 값</div>
                <div className={styles.cardHint}>groupId: {selectedGroupId || "-"}</div>
              </div>

              <div className={styles.formRow}>
                <input className={styles.input} value={valueForm.value} onChange={(e) => setValueForm((p) => ({ ...p, value: e.target.value }))} placeholder="옵션 값" />
                <input className={styles.inputSmall} value={valueForm.sortOrder} onChange={(e) => setValueForm((p) => ({ ...p, sortOrder: e.target.value }))} placeholder="정렬순서" />
                <button className={styles.primaryBtn} onClick={onCreateValue} disabled={valueCreate.isPending}>추가</button>
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
                        <button className={styles.dangerBtn} onClick={() => onDeleteValue(v.optionValueId)} disabled={valueDelete.isPending}>삭제</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 할인 탭 */}
      {tab === "DISCOUNT" ? (
        <div className={styles.section}>
          {discountsQ.isLoading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : discountsQ.error ? (
            <div className={styles.errorBox}>{discountsQ.error instanceof Error ? discountsQ.error.message : "할인 조회 오류"}</div>
          ) : (
            <>
              <div className={styles.row}>
                <label className={styles.label}>
                  discountValue
                  <input
                    className={styles.input}
                    value={discountForm.discountValue}
                    onChange={(e) => setDiscountForm((p) => ({ ...p, discountValue: e.target.value }))}
                    placeholder="예: 10"
                  />
                </label>

                <label className={styles.label}>
                  discountType
                  <input
                    className={styles.input}
                    value={discountForm.discountType}
                    onChange={(e) => setDiscountForm((p) => ({ ...p, discountType: e.target.value }))}
                    placeholder="예: PERCENT / AMOUNT"
                  />
                </label>

                <label className={styles.label}>
                  startAt(선택)
                  <input
                    className={styles.input}
                    value={discountForm.startAt}
                    onChange={(e) => setDiscountForm((p) => ({ ...p, startAt: e.target.value }))}
                    placeholder="2026-01-21T10:30"
                  />
                </label>

                <label className={styles.label}>
                  endAt(선택)
                  <input
                    className={styles.input}
                    value={discountForm.endAt}
                    onChange={(e) => setDiscountForm((p) => ({ ...p, endAt: e.target.value }))}
                    placeholder="2026-01-21T23:59"
                  />
                </label>

                <button className={styles.primaryBtn} onClick={onCreateDiscount} disabled={discountCreate.isPending}>
                  할인 등록
                </button>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>discountId</th>
                      <th>productId</th>
                      <th>discountValue</th>
                      <th>discountType</th>
                      <th>startAt</th>
                      <th>endAt</th>
                      <th>createdAt</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className={styles.empty}>할인이 없습니다.</td>
                      </tr>
                    ) : (
                      discounts.map((d) => (
                        <tr key={d.discountId}>
                          <td>{d.discountId}</td>
                          <td>{d.productId}</td>
                          <td>{d.discountValue}</td>
                          <td>{d.discountType}</td>
                          <td>{d.startAt ?? "-"}</td>
                          <td>{d.endAt ?? "-"}</td>
                          <td>{d.createdAt ?? "-"}</td>
                          <td className={styles.actionsTd}>
                            <button className={styles.smallBtn} onClick={() => onEditDiscount(d)} disabled={discountUpdate.isPending}>수정</button>
                            <button className={styles.dangerBtn} onClick={() => onDeleteDiscount(d.discountId)} disabled={discountDelete.isPending}>삭제</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
