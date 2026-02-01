// src/types/admin/payment.ts
export type AdminPaymentId = number;

export type AdminPaymentStatus = string; // 백엔드 enum 확정되면 union으로 잠그세요

export type AdminPaymentListParams = {
  page?: number; // default 1
  size?: number; // default 20
  userEmail?: string;
  orderId?: number;
  orderCode?: string;
  paymentStatus?: string;
};

export type AdminPaymentListItem = {
  paymentId: AdminPaymentId;
  orderId: number;
  userId: number;
  userEmail: string;
  orderCode: string;

  paymentMethod: string;
  paymentAmount: number;
  paymentStatus: AdminPaymentStatus;

  pgTid: string;
  paidAt: string | null;     // LocalDateTime -> ISO string
  createdAt: string;         // LocalDateTime -> ISO string
};

export type AdminPaymentDetail = {
  paymentId: AdminPaymentId;
  orderId: number;
  userId: number;
  userEmail: string;
  orderCode: string;

  paymentMethod: string;
  paymentAmount: number;
  paymentStatus: AdminPaymentStatus;

  pgTid: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminPaymentCancelBody = {
  amount: number;
  reason?: string;
};
