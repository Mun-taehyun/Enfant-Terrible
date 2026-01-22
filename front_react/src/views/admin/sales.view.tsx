// src/views/admin/sales.view.tsx

import { useMemo, useState } from "react";
import styles from "./sales.view.module.css";

import { useAdminSalesSummary } from "@/hooks/admin/adminSales.hook";
import type { AdminSalesGroupBy, AdminSalesRange } from "@/types/admin/sales";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** 로컬 기준 YYYY-MM-DD */
function toYmdLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function formatWon(n: number) {
  return new Intl.NumberFormat("ko-KR").format(n);
}

export default function SalesView() {
  const today = useMemo(() => new Date(), []);

  const defaultRange: AdminSalesRange = useMemo(() => {
    const to = toYmdLocal(today);
    const from = toYmdLocal(addDays(today, -6));
    return { from, to };
  }, [today]);

  const [range, setRange] = useState<AdminSalesRange>(defaultRange);
  const [groupBy, setGroupBy] = useState<AdminSalesGroupBy>("DAY");

  const q = useAdminSalesSummary(range, groupBy);

  // ✅ 오늘/7일/30일: 백엔드 기능이 아니라 프론트에서 기간 계산 후 paidFrom/paidTo로 보내는 UI
  const onClickToday = () => {
    const d = toYmdLocal(new Date());
    setRange({ from: d, to: d });
  };

  const onClick7days = () => {
    const base = new Date();
    const to = toYmdLocal(base);
    const from = toYmdLocal(addDays(base, -6));
    setRange({ from, to });
  };

  const onClick30days = () => {
    const base = new Date();
    const to = toYmdLocal(base);
    const from = toYmdLocal(addDays(base, -29));
    setRange({ from, to });
  };

  const loading = q.isLoading;
  const errorMsg = (q.error as Error | null)?.message || "";

  const totalAmount = typeof q.data?.totalAmount === "number" ? q.data.totalAmount : 0;
  const totalCount = typeof q.data?.totalCount === "number" ? q.data.totalCount : 0;
  const items = Array.isArray(q.data?.items) ? q.data.items : [];

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>쇼핑몰 매출 확인</h1>

        <div className={styles.controls}>
          <button type="button" className={styles.btn} onClick={onClickToday}>
            오늘
          </button>
          <button type="button" className={styles.btn} onClick={onClick7days}>
            최근 7일
          </button>
          <button type="button" className={styles.btn} onClick={onClick30days}>
            최근 30일
          </button>

          <div className={styles.range}>
            <label className={styles.label}>
              from
              <input
                className={styles.input}
                type="date"
                value={range.from}
                onChange={(e) => setRange((p) => ({ ...p, from: e.target.value }))}
              />
            </label>

            <label className={styles.label}>
              to
              <input
                className={styles.input}
                type="date"
                value={range.to}
                onChange={(e) => setRange((p) => ({ ...p, to: e.target.value }))}
              />
            </label>

            <label className={styles.label}>
              기간 묶음
              <select
                className={styles.input}
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as AdminSalesGroupBy)}
              >
                <option value="DAY">DAY</option>
                <option value="MONTH">MONTH</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      {loading && <div className={styles.state}>불러오는 중입니다…</div>}
      {!loading && errorMsg && <div className={styles.error}>에러: {errorMsg}</div>}

      {!loading && !errorMsg && (
        <>
          <div className={styles.cards}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>기간</div>
              <div className={styles.cardValue}>
                {range.from} ~ {range.to}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardLabel}>총 매출</div>
              <div className={styles.cardValue}>{formatWon(totalAmount)} 원</div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardLabel}>결제 건수</div>
              <div className={styles.cardValue}>{formatWon(totalCount)} 건</div>
            </div>
          </div>

          <div className={styles.tableBox}>
            <h2 className={styles.subTitle}>
              {groupBy === "DAY" ? "일별 매출" : "월별 매출"}
            </h2>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>기간</th>
                  <th>매출</th>
                  <th>결제 건수</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.empty}>
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.period}>
                      <td>{row.period}</td>
                      <td>{formatWon(row.totalAmount || 0)} 원</td>
                      <td>{formatWon(row.paymentCount || 0)} 건</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
