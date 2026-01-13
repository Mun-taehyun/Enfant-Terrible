// pages\admin\dashboard\Dashboard.tsx
// 운영 - 쇼핑몰 매출확인 페이지

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import axiosInstance from '@/apis/core/api/axiosInstance';
import styles from './Dashboard.module.css';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

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

type Preset = 'today' | '7d' | '30d' | 'month' | 'all' | 'custom';

// 로컬 기준 YYYY-MM-DD
const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

function isWrapped<T>(v: unknown): v is ApiResponse<T> {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.success === 'boolean' && 'data' in o;
}

function getServerMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const o = payload as Record<string, unknown>;
  const msg = o.message;
  return typeof msg === 'string' ? msg : undefined;
}

const Dashboard = () => {
  const summaryUrl = '/admin/amount/daily';
  const rowsUrl = '/admin/amount';

  // 첫 화면 기본값: 오늘
  const [preset, setPreset] = useState<Preset>('today');

  // 검색 기본값: 최근 7일
  const [from, setFrom] = useState(() => fmt(addDays(new Date(), -6)));
  const [to, setTo] = useState(() => fmt(new Date()));

  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    const qs = p.toString();
    return qs ? `?${qs}` : '';
  }, [from, to]);

  const applyPreset = (p: Exclude<Preset, 'custom'>) => {
    const now = new Date();
    const today = fmt(now);

    setPreset(p);

    if (p === 'today') {
      setFrom(today);
      setTo(today);
      return;
    }
    if (p === '7d') {
      setFrom(fmt(addDays(now, -6)));
      setTo(today);
      return;
    }
    if (p === '30d') {
      setFrom(fmt(addDays(now, -29)));
      setTo(today);
      return;
    }
    if (p === 'month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      setFrom(fmt(first));
      setTo(today);
      return;
    }
    // all
    setFrom('');
    setTo('');
  };

  const fetchData = async (overrideQuery?: string) => {
    setLoading(true);
    setError(null);

    if (from && to && from > to) {
      setError('시작일이 종료일보다 늦습니다.');
      setSummary(null);
      setRows([]);
      setLoading(false);
      return;
    }

    const q = overrideQuery ?? query;

    try {
      const [sRes, rRes] = await Promise.all([
        axiosInstance.get(`${summaryUrl}${q}`),
        axiosInstance.get(`${rowsUrl}${q}`),
      ]);

      const sPayload: unknown = sRes.data;
      const rPayload: unknown = rRes.data;

      // summary
      let sData: SalesSummary | null;
      if (isWrapped<SalesSummary>(sPayload)) {
        if (!sPayload.success) {
          setError(sPayload.message ?? null);
          setSummary(null);
          setRows([]);
          setLoading(false);
          return;
        }
        sData = sPayload.data;
      } else {
        sData = sPayload as SalesSummary;
      }

      // rows
      let rData: SalesRow[];
      if (isWrapped<SalesRow[]>(rPayload)) {
        if (!rPayload.success) {
          setError(rPayload.message ?? null);
          setSummary(null);
          setRows([]);
          setLoading(false);
          return;
        }
        rData = rPayload.data ?? [];
      } else {
        rData = (rPayload as SalesRow[]) ?? [];
      }

      setSummary(sData);
      setRows(rData.slice().sort((a, b) => b.date.localeCompare(a.date)));
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const serverMsg = getServerMessage(e.response?.data);
        setError(serverMsg ?? `HTTP ${e.response?.status ?? 'N/A'}`);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(null);
      }
      setSummary(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // 최초 로드
  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className={styles.loading}>데이터 로딩 중...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>관리자 대시보드</h2>

      {/* 프리셋 + 기간 입력 */}
      <div className={styles.filterBar}>
        <div className={styles.presetGroup}>
          <button
            type="button"
            className={`${styles.presetButton} ${preset === 'today' ? styles.presetActive : ''}`}
            onClick={() => {
              applyPreset('today');
              // state 반영 후 호출
              setTimeout(() => void fetchData(), 0);
            }}
          >
            오늘
          </button>

          <button
            type="button"
            className={`${styles.presetButton} ${preset === '7d' ? styles.presetActive : ''}`}
            onClick={() => {
              applyPreset('7d');
              setTimeout(() => void fetchData(), 0);
            }}
          >
            최근 7일
          </button>

          <button
            type="button"
            className={`${styles.presetButton} ${preset === '30d' ? styles.presetActive : ''}`}
            onClick={() => {
              applyPreset('30d');
              setTimeout(() => void fetchData(), 0);
            }}
          >
            최근 30일
          </button>

          <button
            type="button"
            className={`${styles.presetButton} ${preset === 'month' ? styles.presetActive : ''}`}
            onClick={() => {
              applyPreset('month');
              setTimeout(() => void fetchData(), 0);
            }}
          >
            이번달
          </button>

          <button
            type="button"
            className={`${styles.presetButton} ${preset === 'all' ? styles.presetActive : ''}`}
            onClick={() => {
              applyPreset('all');
              setTimeout(() => void fetchData(), 0);
            }}
          >
            전체
          </button>
        </div>

        <div className={styles.dateGroup}>
          <label className={styles.dateLabel}>
            시작일
            <input
              className={styles.dateInput}
              type="date"
              value={from}
              onChange={e => {
                setPreset('custom');
                setFrom(e.target.value);
              }}
            />
          </label>

          <label className={styles.dateLabel}>
            종료일
            <input
              className={styles.dateInput}
              type="date"
              value={to}
              onChange={e => {
                setPreset('custom');
                setTo(e.target.value);
              }}
            />
          </label>

          <button type="button" className={styles.applyButton} onClick={() => void fetchData()}>
            적용
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      {summary && (
        <div className={styles.summaryGrid}>
          <div className={styles.card}>총 매출: {summary.totalAmount.toLocaleString()}원</div>
          <div className={styles.card}>주문 수: {summary.orderCount}</div>
          <div className={styles.card}>환불 수: {summary.refundCount}</div>
          <div className={styles.card}>배송 완료: {summary.completedDeliveryCount}</div>
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
                <td className={styles.td}>{row.totalAmount.toLocaleString()}원</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
