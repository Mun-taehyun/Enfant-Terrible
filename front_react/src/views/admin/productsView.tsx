// src/views/admin/product/productsView.tsx
import { useMemo, useState } from "react";
import styles from "./productsView.module.css";

import type { AdminProductListParams } from "@/types/admin/product";
import { useAdminProducts } from "@/hooks/admin/adminProduct.hook";
import ProductDetailView from "./productDetailView";

export default function ProductsView() {
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);

  const [status, setStatus] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [productCode, setProductCode] = useState<string>("");

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

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

  const listQ = useAdminProducts(params);

  const rows = listQ.data?.content ?? [];
  const totalPages = listQ.data?.totalPages ?? 1;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>상품 관리</h2>
      </div>

      <div className={styles.filters}>
        <label className={styles.label}>
          status
          <input
            className={styles.input}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="ON_SALE / STOPPED / HIDDEN / SOLD_OUT"
          />
        </label>

        <label className={styles.label}>
          keyword(상품명)
          <input
            className={styles.input}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="상품명 검색"
          />
        </label>

        <label className={styles.label}>
          productCode
          <input
            className={styles.input}
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            placeholder="상품코드 검색"
          />
        </label>

        <label className={styles.labelSmall}>
          size
          <select className={styles.select} value={size} onChange={(e) => setSize(Number(e.target.value))}>
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
                <th>productId</th>
                <th>productCode</th>
                <th>name</th>
                <th>basePrice</th>
                <th>status</th>
                <th>category</th>
                <th>createdAt</th>
                <th>actions</th>
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
                      {p.categoryName} (#{p.categoryId})
                    </td>
                    <td>{p.createdAt}</td>
                    <td className={styles.actions}>
                      <button className={styles.smallBtn} onClick={() => setSelectedProductId(p.productId)}>
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
        <button className={styles.smallBtn} disabled={page <= 1} onClick={() => setPage((v: number) => Math.max(1, v - 1))}>
          이전
        </button>
        <span className={styles.pageText}>
          {page} / {totalPages}
        </span>
        <button className={styles.smallBtn} disabled={page >= totalPages} onClick={() => setPage((v: number) => Math.min(totalPages, v + 1))}>
          다음
        </button>
      </div>

      {selectedProductId ? (
        <div className={styles.detailPanel}>
          <ProductDetailView productId={selectedProductId} onClose={() => setSelectedProductId(null)} />
        </div>
      ) : null}
    </div>
  );
}
