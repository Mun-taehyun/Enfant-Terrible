// src/types/admin/order.ts
import type { AdminPageResponse } from "@/types/admin/api";

/** 주문 상태 (백 enum 확정되면 여기만 수정) */
export type AdminOrderStatus =
  | "PAID"
  | "PREPARING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

/** 목록 정렬 기준 */
export type AdminOrderSortBy = "ORDER_ID" | "TOTAL_AMOUNT" | "SHIPPED_AT" | "DELIVERED_AT";

/** 목록 파라미터 = 백 AdminOrderListRequest 기준 */
export type AdminOrderListParams = {
  page: number;
  size: number;

  userId?: number;
  orderCode?: string;
  status?: AdminOrderStatus;

  minTotalAmount?: number;
  maxTotalAmount?: number;

  shippedFrom?: string;   // ISO string or "YYYY-MM-DDTHH:mm:ss"
  shippedTo?: string;
  deliveredFrom?: string;
  deliveredTo?: string;

  sortBy?: AdminOrderSortBy;
  direction?: "ASC" | "DESC";
};

export type AdminOrderListItem = {
  orderId: number;
  userId: number;
  orderCode: string;
  status: AdminOrderStatus;
  totalAmount: number;

  receiverName: string;
  receiverPhone: string;

  /** 배송 전에는 null일 수 있음 */
  trackingNumber: string | null;

  /** 배송 전/완료 전에는 null일 수 있음 */
  shippedAt: string | null;
  deliveredAt: string | null;
};

export type AdminOrderItem = {
  skuId: number;
  productName: string;
  price: number;
  quantity: number;

  cancelledQuantity: number | null;
  remainingQuantity: number | null;
};

export type AdminOrderDetail = {
  orderId: number;
  userId: number;
  orderCode: string;
  status: AdminOrderStatus;
  totalAmount: number;

  receiverName: string;
  receiverPhone: string;
  zipCode: string;
  addressBase: string;
  addressDetail: string;

  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;

  items: AdminOrderItem[];
};

export type AdminOrderStatusUpdatePayload = {
  status: AdminOrderStatus;
};

export type AdminOrderShippingStartPayload = {
  trackingNumber: string;
};

export type AdminOrderCancelItem = {
  skuId: number;
  quantity: number;
};

export type AdminOrderCancelPayload = {
  items: AdminOrderCancelItem[];
  reason?: string;
};

/** 응답 타입 별칭 (원하시면 response 폴더로 분리해도 됨) */
export type AdminOrderListPage = AdminPageResponse<AdminOrderListItem>;
