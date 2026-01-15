// src/views/admin/sales.view.tsx
import { useMemo, useState } from "react";
import styles from "./sales.view.module.css";

import { useAdminAmount, useAdminAmountDaily } from "@/hooks/admin/adminSales.hook";
import type { AdminSalesRange } from "@/types/admin/sales";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** ✅ UTC(toISOString)로 날짜가 하루 밀리는 문제 피하려고 로컬 기준 YYYY-MM-DD */
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
    const from = toYmdLocal(addDays(today, -6)); // 최근 7일(오늘 포함)
    return { from, to };
  }, [today]);

  const [range, setRange] = useState<AdminSalesRange>(defaultRange);

  const amountQuery = useAdminAmount(range);
  const dailyQuery = useAdminAmountDaily(range);

  const summary = amountQuery.data;
  const daily = dailyQuery.data ?? [];

  // 백엔드 필드명이 totalAmount/amount 중 뭐가 와도 표시되게 처리
  const totalAmount =
    typeof summary?.totalAmount === "number"
      ? summary.totalAmount
      : typeof summary?.amount === "number"
        ? summary.amount
        : 0;

  const orderCount =
    typeof summary?.orderCount === "number"
      ? summary.orderCount
      : typeof summary?.count === "number"
        ? summary.count
        : undefined;

  const onClick7days = () => {
    const to = toYmdLocal(new Date());
    const from = toYmdLocal(addDays(new Date(), -6));
    setRange({ from, to });
  };

  const onClick30days = () => {
    const to = toYmdLocal(new Date());
    const from = toYmdLocal(addDays(new Date(), -29));
    setRange({ from, to });
  };

  const loading = amountQuery.isLoading || dailyQuery.isLoading;
  const errorMsg =
    (amountQuery.error as Error | null)?.message ||
    (dailyQuery.error as Error | null)?.message ||
    "";

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>쇼핑몰 매출 확인</h1>

        <div className={styles.controls}>
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
              <div className={styles.cardLabel}>주문 수</div>
              <div className={styles.cardValue}>
                {typeof orderCount === "number" ? `${formatWon(orderCount)} 건` : "—"}
              </div>
            </div>
          </div>

          <div className={styles.tableBox}>
            <h2 className={styles.subTitle}>일별 매출</h2>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>매출</th>
                  <th>주문 수</th>
                </tr>
              </thead>
              <tbody>
                {daily.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.empty}>
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  daily.map((row) => {
                    const amount =
                      typeof row.totalAmount === "number"
                        ? row.totalAmount
                        : typeof row.amount === "number"
                          ? row.amount
                          : 0;

                    const cnt =
                      typeof row.orderCount === "number"
                        ? row.orderCount
                        : typeof row.count === "number"
                          ? row.count
                          : undefined;

                    return (
                      <tr key={row.date}>
                        <td>{row.date}</td>
                        <td>{formatWon(amount)} 원</td>
                        <td>{typeof cnt === "number" ? `${formatWon(cnt)} 건` : "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
