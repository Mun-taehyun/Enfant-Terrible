// src/types/admin/sales.ts

export type AdminSalesGroupBy = "DAY" | "MONTH";

/** 화면용 날짜 입력(YYYY-MM-DD) */
export type AdminSalesRange = {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
};

/** GET /api/admin/sales 요청(Query) - 백엔드 DTO(AdminSalesSummaryRequest) 기준 */
export type AdminSalesSummaryParams = {
  paidFrom: string; // LocalDateTime 문자열 (예: 2026-01-16T00:00:00)
  paidTo: string;   // LocalDateTime 문자열 (예: 2026-01-22T23:59:59)
  groupBy?: AdminSalesGroupBy; // default: DAY
};

/** 백엔드 AdminSalesSummaryRow */
export type AdminSalesSummaryRow = {
  period: string;
  totalAmount: number;
  paymentCount: number;
};

/** 백엔드 AdminSalesSummaryResponse */
export type AdminSalesSummaryData = {
  totalAmount: number; // Long
  totalCount: number;  // Integer
  items: AdminSalesSummaryRow[];
};
