// src/views/admin/productsView.tsx
import { useMemo, useState } from "react";
import styles from "./productsView.module.css";

import type { AdminProductListParams } from "@/types/admin/product";
import { useAdminProductCreate, useAdminProducts } from "@/hooks/admin/adminProduct.hook";
import ProductDetailView from "@/views/admin/productsDetailView";

const PRODUCT_STATUS_OPTIONS = [
  { value: "ON_SALE", label: "판매중" },
  { value: "STOPPED", label: "판매중지" },
  { value: "SOLD_OUT", label: "품절" },
  { value: "HIDDEN", label: "비노출" },
] as const;

function toNumberOrThrow(v: string, label: string): number {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`${label}은(는) 숫자여야 합니다.`);
  return n;
}

export default function ProductsView() {
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);

  const [status, setStatus] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [productCode, setProductCode] = useState<string>("");

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string>("");
  const [createForm, setCreateForm] = useState<{
    productCode: string;
    categoryId: string;
    name: string;
    basePrice: string;
    status: string;
  }>({
    productCode: "",
    categoryId: "",
    name: "",
    basePrice: "",
    status: "",
  });

  const [createThumbnailFile, setCreateThumbnailFile] = useState<File | null>(null);

  const params: AdminProductListParams = useMemo(
    () => ({
      page,
      size,
      status: status.trim() || undefined,
      keyword: keyword.trim() || undefined,
      productCode: productCode.trim() || undefined,
    }),
    [page, size, status, keyword, productCode]
  );

  // ✅ 훅의 data는 "unwrapOrThrow 결과" (= AdminPageResponse<AdminProduct>) 여야 함
  const listQ = useAdminProducts(params);
  const createMut = useAdminProductCreate();

  const rows = listQ.data?.list ?? [];
  const totalCount = listQ.data?.totalCount ?? 0;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / size) : 1;

  async function onCreateProduct() {
    setCreateError("");
    try {
      const req = {
        productCode: createForm.productCode.trim(),
        categoryId: toNumberOrThrow(createForm.categoryId, "카테고리 ID"),
        name: createForm.name.trim(),
        basePrice: toNumberOrThrow(createForm.basePrice, "기본가"),
        status: createForm.status.trim(),
      };

      if (!req.productCode) throw new Error("상품코드는 필수입니다.");
      if (!req.name) throw new Error("상품명은 필수입니다.");
      if (!req.status) throw new Error("판매상태는 필수입니다.");

      const formData = new FormData();
      formData.append("req", new Blob([JSON.stringify(req)], { type: "application/json" }));
      if (createThumbnailFile) {
        formData.append("image", createThumbnailFile);
      }

      await createMut.mutateAsync(formData);

      setShowCreate(false);
      setCreateForm({
        productCode: "",
        categoryId: "",
        name: "",
        basePrice: "",
        status: "",
      });
      setCreateThumbnailFile(null);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "상품 등록에 실패했습니다.");
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>상품 관리</h2>
        <button
          className={styles.secondaryBtn}
          onClick={() => {
            setShowCreate((v: boolean) => !v);
            setCreateError("");
            setSelectedProductId(null);
          }}
        >
          상품 등록
        </button>
      </div>

      {showCreate ? (
        <div className={styles.createPanel}>
          {createError ? <div className={styles.errorBox}>{createError}</div> : null}

          <div className={styles.createGrid}>
            <label className={styles.label}>
              상품코드
              <input
                className={styles.input}
                value={createForm.productCode}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, productCode: e.target.value }))
                }
              />
            </label>

            <label className={styles.label}>
              카테고리 ID
              <input
                className={styles.input}
                value={createForm.categoryId}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, categoryId: e.target.value }))
                }
              />
            </label>

            <label className={styles.label}>
              상품명
              <input
                className={styles.input}
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              />
            </label>

            <label className={styles.label}>
              기본가
              <input
                className={styles.input}
                value={createForm.basePrice}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, basePrice: e.target.value }))
                }
              />
            </label>

            <label className={styles.label}>
              판매상태
              <select
                className={styles.select}
                value={createForm.status}
                onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value }))}
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
                  setCreateThumbnailFile(f);
                }}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.secondaryBtn}
              onClick={() => {
                setShowCreate(false);
                setCreateError("");
              }}
              disabled={createMut.isPending}
            >
              취소
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={onCreateProduct}
              disabled={createMut.isPending}
            >
              등록
            </button>
          </div>
        </div>
      ) : null}

      <div className={styles.filters}>
        <label className={styles.label}>
          판매상태
          <input
            className={styles.input}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="예: ACTIVE / INACTIVE 등(백엔드 enum 기준)"
          />
        </label>

        <label className={styles.label}>
          상품명
          <input
            className={styles.input}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="상품명 검색"
          />
        </label>

        <label className={styles.label}>
          상품코드
          <input
            className={styles.input}
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            placeholder="상품코드 검색"
          />
        </label>

        <label className={styles.labelSmall}>
          페이지당 개수
          <select
            className={styles.select}
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>

        <button className={styles.secondaryBtn} onClick={() => setPage(1)}>
          검색 적용
        </button>
      </div>

      {listQ.error ? (
        <div className={styles.errorBox}>
          {listQ.error instanceof Error ? listQ.error.message : "조회 오류"}
        </div>
      ) : null}

      <div className={styles.tableWrap}>
        {listQ.isLoading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>상품 ID</th>
                <th>상품코드</th>
                <th>상품명</th>
                <th>기본가</th>
                <th>판매상태</th>
                <th>카테고리</th>
                <th>생성일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.productId}>
                    <td>{p.productId}</td>
                    <td>{p.productCode}</td>
                    <td>{p.name}</td>
                    <td>{p.basePrice}</td>
                    <td>{p.status}</td>
                    <td>
                      {p.categoryName} (ID: {p.categoryId})
                    </td>
                    <td>{p.createdAt}</td>
                    <td className={styles.actions}>
                      <button
                        className={styles.smallBtn}
                        onClick={() => setSelectedProductId(p.productId)}
                      >
                        상세
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
        <button
          className={styles.smallBtn}
          disabled={page <= 1}
          onClick={() => setPage((v: number) => Math.max(1, v - 1))}
        >
          이전
        </button>
        <span className={styles.pageText}>
          {page} / {totalPages} (총 {totalCount}개)
        </span>
        <button
          className={styles.smallBtn}
          disabled={page >= totalPages}
          onClick={() => setPage((v: number) => Math.min(totalPages, v + 1))}
        >
          다음
        </button>
      </div>

      {selectedProductId ? (
        <div className={styles.detailPanel}>
          <ProductDetailView
            productId={selectedProductId}
            onClose={() => setSelectedProductId(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
