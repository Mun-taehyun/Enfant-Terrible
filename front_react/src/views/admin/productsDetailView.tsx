// src/views/admin/product/ProductDetailView.tsx
// ✅ 기존 PRODUCT/SKU/OPTION 탭 + DISCOUNT 탭 추가(상품 할인 CRUD)

import { useEffect, useMemo, useState } from "react";
import styles from "./productsDetailView.module.css";

import type {
  AdminProductSavePayload,
} from "@/types/admin/product";

import type {
  AdminProductDiscountSavePayload,
  AdminProductDiscountItem,
} from "@/types/admin/discount";

import {
  useAdminProductDetail,
  useAdminProductUpdate,
  useAdminProductDelete,
  useAdminProductContentImagesAdd,
  useAdminProductContentImageDelete,
} from "@/hooks/admin/adminProduct.hook";

import {
  useAdminProductDiscounts,
  useAdminProductDiscountCreate,
  useAdminProductDiscountUpdate,
  useAdminProductDiscountDelete,
} from "@/hooks/admin/adminDiscount.hook";

import { useAdminCategoryTree } from "@/querys/admin/adminCategories.query";
import type { AdminCategory } from "@/types/admin/category";

import AdminProductOptionSkuPanel from "@/components/admin/AdminProductOptionSkuPanel";

type Props = {
  productId: number;
  onClose: () => void;
};

type TabKey = "PRODUCT" | "OPTION" | "DISCOUNT";

type ProductFormState = {
  productCode: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: string;
  status: string;
};

const PRODUCT_STATUS_OPTIONS = [
  { value: "ON_SALE", label: "판매중" },
  { value: "STOPPED", label: "판매중지" },
  { value: "SOLD_OUT", label: "품절" },
  { value: "HIDDEN", label: "비노출" },
] as const;

const PRODUCT_STATUS_SET: ReadonlySet<string> = new Set(
  PRODUCT_STATUS_OPTIONS.map((o) => o.value)
);

function toNumberOrThrow(v: string, label: string): number {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`${label}은(는) 숫자여야 합니다.`);
  return n;
}

function toOptionalDateTimeLocalString(v: string): string | null | undefined {
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

  const contentImagesAddMut = useAdminProductContentImagesAdd(productId);
  const contentImageDeleteMut = useAdminProductContentImageDelete(productId);

  const [form, setForm] = useState<ProductFormState>({
    productCode: "",
    categoryId: "",
    name: "",
    description: "",
    basePrice: "",
    status: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [newContentImages, setNewContentImages] = useState<File[]>([]);

  const categoryTreeQ = useAdminCategoryTree();

  const leafCategories = useMemo(() => {
    const raw = (categoryTreeQ.data ?? []) as unknown as Array<
      AdminCategory & { isActive?: "Y" | "N" | boolean | null | undefined }
    >;

    const isActive = (c: (typeof raw)[number]) => {
      if (typeof c.isActive === "string") return c.isActive === "Y";
      if (typeof c.isActive === "boolean") return c.isActive;
      return c.status === "ACTIVE";
    };

    const hasAnyChildren = raw.some((n) => (n.children?.length ?? 0) > 0);
    if (hasAnyChildren) {
      const out: AdminCategory[] = [];
      const walk = (nodes: (typeof raw)) => {
        for (const n of nodes) {
          const children = n.children ?? [];
          if (children.length === 0) {
            if (isActive(n)) out.push(n);
          } else {
            walk(children as (typeof raw));
          }
        }
      };
      walk(raw);
      return out;
    }

    const hasChild = new Set<number>();
    for (const n of raw) {
      if (n.parentId != null) hasChild.add(n.parentId);
    }

    return raw
      .filter((n) => !hasChild.has(n.categoryId))
      .filter((n) => isActive(n));
  }, [categoryTreeQ.data]);

  useEffect(() => {
    const p = detailQ.data;
    if (!p) return;
    setForm({
      productCode: p.productCode ?? "",
      categoryId: String(p.categoryId ?? ""),
      name: p.name ?? "",
      description: p.description ?? "",
      basePrice: String(p.basePrice ?? ""),
      status: String(p.status ?? ""),
    });
    setThumbnailFile(null);
    setNewContentImages([]);
  }, [detailQ.data]);

  async function onSaveProduct() {
    setUiError("");
    try {
      const payload: AdminProductSavePayload = {
        productCode: form.productCode.trim(),
        categoryId: toNumberOrThrow(form.categoryId, "카테고리 ID"),
        name: form.name.trim(),
        description: form.description,
        basePrice: toNumberOrThrow(form.basePrice, "기본가"),
        status: form.status.trim(),
      };

      if (!payload.productCode) throw new Error("상품코드는 필수입니다.");
      if (!payload.name) throw new Error("상품명은 필수입니다.");
      if (!payload.status) throw new Error("판매상태는 필수입니다.");

      // ✅ 백 enum(ProductStatus.name())과 정확히 맞추기: ON_SALE|STOPPED|SOLD_OUT|HIDDEN만 허용
      if (!PRODUCT_STATUS_SET.has(payload.status)) {
        throw new Error(`유효하지 않은 상품 상태입니다: ${payload.status}`);
      }

      const formData = new FormData();
      formData.append("req", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (thumbnailFile) {
        formData.append("image", thumbnailFile);
      }

      await updateMut.mutateAsync({ productId, payload: formData });
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    }
  }

  async function onAddContentImages() {
    setUiError("");
    try {
      if (newContentImages.length === 0) return;
      await contentImagesAddMut.mutateAsync(newContentImages);
      setNewContentImages([]);
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "본문 이미지 추가 중 오류가 발생했습니다.");
    }
  }

  async function onDeleteContentImage(fileId: number) {
    setUiError("");
    try {
      const ok = window.confirm(`본문 이미지를 삭제하시겠습니까?`);
      if (!ok) return;
      await contentImageDeleteMut.mutateAsync(fileId);
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "본문 이미지 삭제 중 오류가 발생했습니다.");
    }
  }

  async function onDeleteProduct() {
    setUiError("");
    try {
      const ok = window.confirm(
        `상품을 삭제(soft delete)하시겠습니까?`
      );
      if (!ok) return;
      await deleteMut.mutateAsync(productId);
      onClose();
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "삭제 중 오류가 발생했습니다.");
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
  }>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const startAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
    return {
      discountValue: "",
      discountType: "rate",
      startAt,
      endAt: "",
    };
  });

  // ====== DISCOUNT ======

  async function onCreateDiscount() {
    setUiError("");
    try {
      const discountValue = Number(discountForm.discountValue);
      if (!Number.isFinite(discountValue)) throw new Error("할인 값은 숫자여야 합니다.");
      const discountType = discountForm.discountType.trim();
      if (!discountType) throw new Error("할인 유형은 필수입니다.");

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
      const v = prompt("할인 값 (필수)", String(row.discountValue));
      if (v === null) return;

      const t = prompt("할인 유형 (필수)", String(row.discountType));
      if (t === null) return;

      const s = prompt("시작 일시 (선택, 예: 2026-01-21T10:30)", String(row.startAt ?? ""));
      if (s === null) return;

      const e = prompt("종료 일시 (선택, 예: 2026-01-21T23:59)", String(row.endAt ?? ""));
      if (e === null) return;

      const discountValue = Number(v);
      if (!Number.isFinite(discountValue)) throw new Error("할인 값은 숫자여야 합니다.");
      const discountType = t.trim();
      if (!discountType) throw new Error("할인 유형은 필수입니다.");

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
      const ok = window.confirm(`상품 할인을 삭제하시겠습니까?`);
      if (!ok) return;
      await discountDelete.mutateAsync(discountId);
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "할인 삭제 오류");
    }
  }

  const product = detailQ.data;

  const contentImages = detailQ.data?.images ?? [];

  const discounts = discountsQ.data ?? [];

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <div className={styles.topTitle}>상품 상세 패널</div>
        <button className={styles.closeBtn} onClick={onClose}>
          닫기
        </button>
      </div>

      {uiError ? <div className={styles.errorBox}>{uiError}</div> : null}

      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${tab === "PRODUCT" ? styles.active : ""}`}
          onClick={() => setTab("PRODUCT")}
        >
          상품
        </button>
        <button
          className={`${styles.tabBtn} ${tab === "OPTION" ? styles.active : ""}`}
          onClick={() => setTab("OPTION")}
        >
          옵션/SKU
        </button>
        <button
          className={`${styles.tabBtn} ${tab === "DISCOUNT" ? styles.active : ""}`}
          onClick={() => setTab("DISCOUNT")}
        >
          할인
        </button>
      </div>

      {/* 상품 탭 */}
      {tab === "PRODUCT" ? (
        <div className={styles.section}>
          {detailQ.isLoading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : detailQ.error ? (
            <div className={styles.errorBox}>
              {detailQ.error instanceof Error ? detailQ.error.message : "상세 조회 오류"}
            </div>
          ) : !product ? (
            <div className={styles.empty}>상세 데이터가 없습니다.</div>
          ) : (
            <>
              <div className={styles.formGrid}>
                <label className={styles.label}>
                  상품코드
                  <input
                    className={styles.input}
                    value={form.productCode}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, productCode: e.target.value }))
                    }
                  />
                </label>

                <label className={styles.label}>
                  카테고리
                  <select
                    className={styles.select}
                    value={form.categoryId}
                    onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                  >
                    <option value="">선택</option>
                    {leafCategories.map((c) => (
                      <option key={c.categoryId} value={String(c.categoryId)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.label}>
                  상품명
                  <input
                    className={styles.input}
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </label>

                <label className={styles.label}>
                  상품설명
                  <textarea
                    className={styles.textarea}
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                </label>

                <label className={styles.label}>
                  기본가
                  <input
                    className={styles.input}
                    value={form.basePrice}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, basePrice: e.target.value }))
                    }
                  />
                </label>

                {/* ✅ status를 select로 변경 (백 enum name과 동일 값만 전송) */}
                <label className={styles.label}>
                  판매상태
                  <select
                    className={styles.select}
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    <option value="">선택</option>
                    {PRODUCT_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label} ({o.value})
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.label}>
                  썸네일 파일 (선택)
                  <input
                    className={styles.input}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                      setThumbnailFile(f);
                    }}
                  />
                </label>
              </div>

              <div className={styles.section}>
                <div className={styles.subTitle}>본문 이미지</div>

                <div className={styles.formGrid}>
                  <label className={styles.label}>
                    본문 이미지 추가
                    <input
                      className={styles.input}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files ? Array.from(e.target.files) : [];
                        setNewContentImages(files);
                      }}
                    />
                  </label>
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.secondaryBtn}
                    onClick={onAddContentImages}
                    disabled={contentImagesAddMut.isPending || newContentImages.length === 0}
                  >
                    본문 이미지 추가
                  </button>
                </div>

                {contentImages.length === 0 ? (
                  <div className={styles.empty}>등록된 본문 이미지가 없습니다.</div>
                ) : (
                  <div className={styles.imageList}>
                    {contentImages.map((img) => (
                      <div key={img.fileId} className={styles.imageItem}>
                        <a href={img.fileUrl} target="_blank" rel="noreferrer">
                          {img.originalName ?? img.fileUrl}
                        </a>
                        <button
                          className={styles.smallBtn}
                          onClick={() => onDeleteContentImage(img.fileId)}
                          disabled={contentImageDeleteMut.isPending}
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.primaryBtn}
                  onClick={onSaveProduct}
                  disabled={updateMut.isPending}
                >
                  저장
                </button>
                <button
                  className={styles.dangerBtn}
                  onClick={onDeleteProduct}
                  disabled={deleteMut.isPending}
                >
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* 옵션 탭 */}
      {tab === "OPTION" ? (
        <div className={styles.section}>
          <AdminProductOptionSkuPanel productId={productId} />
        </div>
      ) : null}

      {/* 할인 탭 */}
      {tab === "DISCOUNT" ? (
        <div className={styles.section}>
          {discountsQ.isLoading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : discountsQ.error ? (
            <div className={styles.errorBox}>
              {discountsQ.error instanceof Error ? discountsQ.error.message : "할인 조회 오류"}
            </div>
          ) : (
            <>
              <div className={styles.row}>
                <label className={styles.label}>
                  할인 값
                  <input
                    className={styles.input}
                    value={discountForm.discountValue}
                    onChange={(e) =>
                      setDiscountForm((p) => ({ ...p, discountValue: e.target.value }))
                    }
                    placeholder="예: 10"
                  />
                </label>

                <label className={styles.label}>
                  할인 유형
                  <select
                    className={styles.select}
                    value={discountForm.discountType}
                    onChange={(e) =>
                      setDiscountForm((p) => ({ ...p, discountType: e.target.value }))
                    }
                  >
                    <option value="rate">퍼센트(rate)</option>
                    <option value="amount">정액(amount)</option>
                  </select>
                </label>

                <label className={styles.label}>
                  시작 일시(선택)
                  <input
                    className={styles.input}
                    type="datetime-local"
                    value={discountForm.startAt}
                    onChange={(e) =>
                      setDiscountForm((p) => ({ ...p, startAt: e.target.value }))
                    }
                  />
                </label>

                <label className={styles.label}>
                  종료 일시(선택)
                  <input
                    className={styles.input}
                    type="datetime-local"
                    value={discountForm.endAt}
                    onChange={(e) =>
                      setDiscountForm((p) => ({ ...p, endAt: e.target.value }))
                    }
                  />
                </label>

                <button
                  className={styles.primaryBtn}
                  onClick={onCreateDiscount}
                  disabled={discountCreate.isPending}
                >
                  할인 등록
                </button>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>할인 값</th>
                      <th>할인 유형</th>
                      <th>시작 일시</th>
                      <th>종료 일시</th>
                      <th>생성일</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={styles.empty}>
                          할인이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      discounts.map((d) => (
                        <tr key={d.discountId}>
                          <td>{d.discountValue}</td>
                          <td>{d.discountType}</td>
                          <td>{d.startAt ?? "-"}</td>
                          <td>{d.endAt ?? "-"}</td>
                          <td>{d.createdAt ?? "-"}</td>
                          <td className={styles.actionsTd}>
                            <button
                              className={styles.smallBtn}
                              onClick={() => onEditDiscount(d)}
                              disabled={discountUpdate.isPending}
                            >
                              수정
                            </button>
                            <button
                              className={styles.dangerBtn}
                              onClick={() => onDeleteDiscount(d.discountId)}
                              disabled={discountDelete.isPending}
                            >
                              삭제
                            </button>
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
