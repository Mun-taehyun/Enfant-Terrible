import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import axiosInstance from '../../../apis/core/api/axiosInstance';

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

const boxStyle: CSSProperties = {
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '16px',
};

const Dashboard = () => {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [summaryRes, rowsRes] = await Promise.all([
          axiosInstance.get<SalesSummary>('/v1/admin/amount/daily'),
          axiosInstance.get<SalesRow[]>('/v1/admin/amount'),
        ]);

        setSummary(summaryRes.data);
        setRows(rowsRes.data);
      } catch (e) {
        console.error('대시보드 조회 실패', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p>데이터 로딩 중...</p>;

  return (
    <div>
      <h2>관리자 대시보드</h2>

      {summary && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={boxStyle}>총 매출: {summary.totalAmount.toLocaleString()}원</div>
          <div style={boxStyle}>주문 수: {summary.orderCount}</div>
          <div style={boxStyle}>환불 수: {summary.refundCount}</div>
          <div style={boxStyle}>배송 완료: {summary.completedDeliveryCount}</div>
        </div>
      )}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>날짜</th>
            <th>주문 수</th>
            <th>환불 수</th>
            <th>매출</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '16px' }}>
                조회된 데이터가 없습니다.
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.orderCount}</td>
                <td>{row.refundCount}</td>
                <td>{row.totalAmount.toLocaleString()}원</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
