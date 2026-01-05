import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import axios from '../../apis/core/axiosInstance';

/**
 * 기간별 매출 요약 타입
 * GET /api/v1/admin/amount/{period}
 */
type SalesSummary = {
  totalAmount: number;
  orderCount: number;
  refundCount: number;
  completedDeliveryCount: number;
};

/**
 * 🔹 매출 상세 테이블 (UI 전용 / 더미)
 * 추후 GET /api/v1/admin/amount 로 교체
 */
type SalesRow = {
  date: string;
  orderCount: number;
  refundCount: number;
  totalAmount: number;
};

// 🔹 UI 검증용 더미 데이터
const salesList: SalesRow[] = [
  {
    date: '2025-01-01',
    orderCount: 12,
    refundCount: 1,
    totalAmount: 320000,
  },
  {
    date: '2025-01-02',
    orderCount: 18,
    refundCount: 0,
    totalAmount: 540000,
  },
  {
    date: '2025-01-03',
    orderCount: 9,
    refundCount: 2,
    totalAmount: 210000,
  },
  {
    date: '2025-01-04',
    orderCount: 22,
    refundCount: 1,
    totalAmount: 780000,
  },
];

const Dashboard = () => {
  // 🔹 기간 (기본: 월간)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>(
    'monthly'
  );
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 매출 요약 조회 (실제 API)
  useEffect(() => {
    const fetchSalesSummary = async () => {
      try {
        setLoading(true);

        const response = await axios.get<SalesSummary>(
          `/api/v1/admin/amount/${period}`
        );

        setSummary(response.data);
      } catch {
        alert('매출 데이터를 불러오지 못했습니다.');
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesSummary();
  }, [period]);

  if (loading) {
    return <p style={{ marginTop: '24px' }}>매출 데이터를 불러오는 중...</p>;
  }

  if (!summary) {
    return <p style={{ marginTop: '24px' }}>매출 데이터가 없습니다.</p>;
  }

  return (
    <div>
      <h2>쇼핑몰 매출 관리</h2>
      <p>기간별 매출 현황을 확인할 수 있습니다.</p>

      {/* 🔹 기간 선택 */}
      <div style={{ marginTop: '16px' }}>
        <select
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')
          }
        >
          <option value="daily">일간</option>
          <option value="weekly">주간</option>
          <option value="monthly">월간</option>
        </select>
      </div>

      {/* 🔹 매출 요약 카드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginTop: '24px',
        }}
      >
        <div style={cardStyle}>
          <h4>총 매출</h4>
          <strong>{summary.totalAmount.toLocaleString()} 원</strong>
        </div>

        <div style={cardStyle}>
          <h4>주문 건수</h4>
          <strong>{summary.orderCount} 건</strong>
        </div>

        <div style={cardStyle}>
          <h4>환불 건수</h4>
          <strong>{summary.refundCount} 건</strong>
        </div>

        <div style={cardStyle}>
          <h4>배송 완료</h4>
          <strong>{summary.completedDeliveryCount} 건</strong>
        </div>
      </div>

      {/* 🔹 차트 영역 (API 교체 예정) */}
      <div style={{ marginTop: '32px' }}>
        <h4>📊 매출 추이</h4>
        <div
          style={{
            height: '200px',
            backgroundColor: '#f5f6f8',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
          }}
        >
          매출 차트 영역 (추후 구현)
        </div>
      </div>

      {/* 🔹 매출 상세 리스트 (UI 전용) */}
      <div style={{ marginTop: '40px' }}>
        <h4>📋 매출 상세 내역</h4>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>날짜</th>
              <th style={thTdStyle}>주문 건수</th>
              <th style={thTdStyle}>환불 건수</th>
              <th style={thTdStyle}>매출 금액</th>
            </tr>
          </thead>
          <tbody>
            {salesList.map((row) => (
              <tr key={row.date}>
                <td style={thTdStyle}>{row.date}</td>
                <td style={thTdStyle}>{row.orderCount} 건</td>
                <td style={thTdStyle}>{row.refundCount} 건</td>
                <td style={thTdStyle}>
                  {row.totalAmount.toLocaleString()} 원
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const cardStyle: CSSProperties = {
  padding: '16px',
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};

const tableStyle: CSSProperties = {
  width: '100%',
  marginTop: '16px',
  borderCollapse: 'collapse',
};

const thTdStyle: CSSProperties = {
  borderBottom: '1px solid #e5e7eb',
  padding: '12px',
  textAlign: 'center',
};

export default Dashboard;
