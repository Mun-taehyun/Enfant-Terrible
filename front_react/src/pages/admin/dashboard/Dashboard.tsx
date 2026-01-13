// pages\admin\dashboard\Dashboard.tsx
// 운영 - 쇼핑몰 매출확인 페이지

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../../../apis/core/api/axiosInstance';
import styles from './Dashboard.module.css';

type SalesSummary = {
  totalAmount: number;
  orderCount: number;
  refundCount: number;
  completedDeliveryCount: number;
};

type SalesRow = {
  date: string;
  orderCount: number;
  refundCount: number;
  totalAmount: number;
};

function toNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

// 백엔드가 { data: ... } 형태로 감싸서 내려주는 경우 대비
function unwrap(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: unknown }).data;
  }
  return payload;
}

function isSalesSummary(v: unknown): v is Record<string, unknown> {
  if (!v || typeof v !== 'object') return false;
  return (
    'totalAmount' in v &&
    'orderCount' in v &&
    'refundCount' in v &&
    'completedDeliveryCount' in v
  );
}

function isSalesRowArray(v: unknown): v is Array<Record<string, unknown>> {
  if (!Array.isArray(v)) return false;
  return v.every(
    row => row && typeof row === 'object' && 'date' in row && 'orderCount' in row && 'refundCount' in row && 'totalAmount' in row
  );
}

const Dashboard = () => {
  // 이 URL은 "프론트 파일"이 아니라 "백엔드 엔드포인트"입니다.
  const summaryUrl = '/admin/amount/daily';
  const rowsUrl = '/admin/amount';

  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseURL = useMemo(() => axiosInstance.defaults.baseURL ?? '(baseURL 미설정)', []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, rowsRes] = await Promise.all([
        axiosInstance.get(summaryUrl),
        axiosInstance.get(rowsUrl),
      ]);

      const summaryPayload = unwrap(summaryRes.data);
      const rowsPayload = unwrap(rowsRes.data);

      if (!isSalesSummary(summaryPayload)) {
        throw new Error(
          `요약 응답 형식 불일치: ${summaryUrl} (예상 필드: totalAmount, orderCount, refundCount, completedDeliveryCount)`
        );
      }
      if (!isSalesRowArray(rowsPayload)) {
        throw new Error(
          `목록 응답 형식 불일치: ${rowsUrl} (예상: [{date, orderCount, refundCount, totalAmount}, ...])`
        );
      }

      const normalizedSummary: SalesSummary = {
        totalAmount: toNumber(summaryPayload.totalAmount),
        orderCount: toNumber(summaryPayload.orderCount),
        refundCount: toNumber(summaryPayload.refundCount),
        completedDeliveryCount: toNumber(summaryPayload.completedDeliveryCount),
      };

      const normalizedRows: SalesRow[] = rowsPayload
        .map(r => ({
          date: String(r.date),
          orderCount: toNumber(r.orderCount),
          refundCount: toNumber(r.refundCount),
          totalAmount: toNumber(r.totalAmount),
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      setSummary(normalizedSummary);
      setRows(normalizedRows);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        const url = `${e.config?.baseURL ?? baseURL}${e.config?.url ?? ''}`;
        setError(`대시보드 조회 실패 (HTTP ${status ?? 'N/A'}) - ${url}`);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('알 수 없는 오류로 대시보드 조회에 실패했습니다.');
      }
      setSummary(null);
      setRows([]);
      console.error('대시보드 조회 실패', e);
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p className={styles.loading}>데이터 로딩 중...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>관리자 대시보드</h2>

      {error && (
        <div className={styles.errorBox}>
          <div className={styles.errorTitle}>오류</div>
          <div className={styles.errorMessage}>{error}</div>
          <div className={styles.debug}>
            <div>baseURL: {baseURL}</div>
            <div>summary: {summaryUrl}</div>
            <div>rows: {rowsUrl}</div>
          </div>
          <button type="button" className={styles.retryButton} onClick={() => void load()}>
            다시 시도
          </button>
        </div>
      )}

      {summary && (
        <div className={styles.summaryGrid}>
          <div className={styles.card}>총 매출: {toNumber(summary.totalAmount).toLocaleString()}원</div>
          <div className={styles.card}>주문 수: {toNumber(summary.orderCount)}</div>
          <div className={styles.card}>환불 수: {toNumber(summary.refundCount)}</div>
          <div className={styles.card}>배송 완료: {toNumber(summary.completedDeliveryCount)}</div>
        </div>
      )}

      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>날짜</th>
            <th className={styles.th}>주문 수</th>
            <th className={styles.th}>환불 수</th>
            <th className={styles.th}>매출</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.emptyCell} colSpan={4}>
                조회된 데이터가 없습니다.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={`${row.date}-${idx}`}>
                <td className={styles.td}>{row.date}</td>
                <td className={styles.td}>{row.orderCount}</td>
                <td className={styles.td}>{row.refundCount}</td>
                <td className={styles.td}>{toNumber(row.totalAmount).toLocaleString()}원</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
