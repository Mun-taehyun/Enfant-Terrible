// src/apis/admin/response/dashboard/GetAdminDashboardResponse.ts

export interface GetAdminDashboardResponse {
  // 상단 요약 지표 (숫자)
  summary: {
    totalRevenue: number;      // 합산 총 매출액
    averageRevenue: number;    // 평균 수익
    revenueGrowth: number;     // 수익 증감도 (%)
    totalOrderCount: number;   // 총 주문 건수
  };
  
  // 매출 그래프용 데이터 (날짜별 매출액 배열)
  dailyTrends: {
    date: string;              // "2026-01-07"
    revenue: number;           // 해당 날짜 매출
  }[];
}


