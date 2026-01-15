// src/types/admin/sales.ts

export type AdminSalesRange = {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
};


export type AdminAmountSummary = {
  from?: string;
  to?: string;
  totalAmount?: number;
  amount?: number;
  orderCount?: number;
  count?: number;
};

export type AdminAmountDailyItem = {
  date: string; // YYYY-MM-DD
  totalAmount?: number;
  amount?: number;
  orderCount?: number;
  count?: number;
};
