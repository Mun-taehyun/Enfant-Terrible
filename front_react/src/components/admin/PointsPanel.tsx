// src/components/admin/PointsPanel.tsx
import { useMemo, useState } from "react";
import styles from "./PointsPanel.module.css";

import type { AdminPointHistoryParams, AdminPointHistorySortBy, AdminPointHistoryDirection } from "@/types/admin/point";
import { useAdminPointAdjust, useAdminPointBalance, useAdminPointHistory } from "@/hooks/admin/adminPoint.hook";

function toInt(v: string, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

type Props = {
  userId: number;
};

export default function PointsPanel({ userId }: Props) {
  // 목록 params (백 DTO 기본값과 동일)
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sortBy, setSortBy] = useState<AdminPointHistorySortBy>("POINT_HISTORY_ID");
  const [direction, setDirection] = useState<AdminPointHistoryDirection>("DESC");

  const params: AdminPointHistoryParams = useMemo(
    () => ({ page, size, sortBy, direction }),
    [page, size, sortBy, direction]
  );

  const bal = useAdminPointBalance(userId);
  const hist = useAdminPointHistory(userId, params);
  const adj = useAdminPointAdjust();

  // adjust form
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [refType, setRefType] = useState<string>("");
  const [refId, setRefId] = useState<string>("");

  const totalCount = hist.data?.totalCount ?? 0;
  const totalPages = size > 0 ? Math.max(1, Math.ceil(totalCount / size)) : 1;

  const onSubmitAdjust = async () => {
    const n = toInt(amount.trim(), NaN as unknown as number);
    if (!Number.isFinite(n)) {
      alert("amount는 숫자여야 합니다.");
      return;
    }
    if (n === 0) {
      alert("amount는 0이 될 수 없습니다.");
      return;
    }

    await adj.mutateAsync({
      userId,
      body: {
        amount: n,
        reason: reason.trim() ? reason.trim() : undefined,
        refType: refType.trim() ? refType.trim() : undefined,
        refId: refId.trim() ? toInt(refId.trim(), 0) : null,
      },
    });

    setAmount("");
    setReason("");
    setRefType("");
    setRefId("");
    alert("관리자 포인트 조정 완료");
  };

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.title}>포인트</div>

        <div className={styles.balanceBox}>
          <div className={styles.balanceLabel}>현재 잔액</div>
          <div className={styles.balanceValue}>
            {bal.isPending ? "로딩..." : (bal.data?.balance ?? 0).toLocaleString()} P
          </div>
          <button type="button" className={styles.smallBtn} onClick={() => bal.refetch()}>
            새로고침
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>관리자 조정</div>

          <div className={styles.formRow}>
            <label className={styles.label}>amount</label>
            <input
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="예: 100 또는 -50"
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>reason</label>
            <input
              className={styles.input}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 보상 / 회수"
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>refType</label>
            <input
              className={styles.input}
              value={refType}
              onChange={(e) => setRefType(e.target.value)}
              placeholder="예: ORDER / EVENT"
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>refId</label>
            <input
              className={styles.input}
              value={refId}
              onChange={(e) => setRefId(e.target.value)}
              placeholder="예: 1001"
            />
          </div>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onSubmitAdjust}
            disabled={adj.isPending}
          >
            {adj.isPending ? "처리 중..." : "조정 실행"}
          </button>

          {adj.isError ? (
            <div className={styles.errorBox}>
              {(adj.error as Error)?.message || "조정에 실패했습니다."}
            </div>
          ) : null}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>히스토리</div>

          <div className={styles.toolbar}>
            <div className={styles.toolItem}>
              <span className={styles.toolLabel}>정렬</span>
              <select
                className={styles.select}
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as AdminPointHistorySortBy);
                  setPage(1);
                }}
              >
                <option value="POINT_HISTORY_ID">POINT_HISTORY_ID</option>
                <option value="CREATED_AT">CREATED_AT</option>
              </select>
            </div>

            <div className={styles.toolItem}>
              <span className={styles.toolLabel}>방향</span>
              <select
                className={styles.select}
                value={direction}
                onChange={(e) => {
                  setDirection(e.target.value as AdminPointHistoryDirection);
                  setPage(1);
                }}
              >
                <option value="DESC">DESC</option>
                <option value="ASC">ASC</option>
              </select>
            </div>

            <div className={styles.toolItem}>
              <span className={styles.toolLabel}>size</span>
              <select
                className={styles.select}
                value={size}
                onChange={(e) => {
                  setSize(toInt(e.target.value, 20));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            <button type="button" className={styles.smallBtn} onClick={() => hist.refetch()}>
              새로고침
            </button>
          </div>

          {hist.isPending ? (
            <div className={styles.loading}>로딩...</div>
          ) : hist.isError ? (
            <div className={styles.errorBox}>
              {(hist.error as Error)?.message || "조회에 실패했습니다."}
            </div>
          ) : (
            <>
              <div className={styles.meta}>
                totalCount: {totalCount.toLocaleString()}
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>amount</th>
                      <th>type</th>
                      <th>reason</th>
                      <th>refType</th>
                      <th>refId</th>
                      <th>createdAt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(hist.data?.list ?? []).map((r) => (
                      <tr key={r.pointHistoryId}>
                        <td>{r.pointHistoryId}</td>
                        <td className={r.pointAmount < 0 ? styles.negative : styles.positive}>
                          {r.pointAmount}
                        </td>
                        <td>{r.pointType}</td>
                        <td>{r.reason ?? ""}</td>
                        <td>{r.refType ?? ""}</td>
                        <td>{r.refId ?? ""}</td>
                        <td>{r.createdAt}</td>
                      </tr>
                    ))}
                    {(hist.data?.list?.length ?? 0) === 0 ? (
                      <tr>
                        <td colSpan={7} className={styles.empty}>
                          데이터가 없습니다.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className={styles.pager}>
                <button
                  type="button"
                  className={styles.smallBtn}
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                >
                  처음
                </button>
                <button
                  type="button"
                  className={styles.smallBtn}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  이전
                </button>

                <div className={styles.pageText}>
                  {page} / {totalPages}
                </div>

                <button
                  type="button"
                  className={styles.smallBtn}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  다음
                </button>
                <button
                  type="button"
                  className={styles.smallBtn}
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                >
                  마지막
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
