// src/apis/admin/response/adminOrder.response.ts
import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type {
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderCancelResult,
} from "@/types/admin/order";

/** GET /api/admin/orders */
export type GetAdminOrdersResponse = ApiResponse<AdminPageResponse<AdminOrderListItem>>;

/** GET /api/admin/orders/{orderId} */
export type GetAdminOrderDetailResponse = ApiResponse<AdminOrderDetail>;

/** PATCH /api/admin/orders/{orderId}/status */
export type PatchAdminOrderStatusResponse = ApiResponse<null>;

/** PATCH /api/admin/orders/{orderId}/shipping */
export type PatchAdminOrderShippingResponse = ApiResponse<null>;

/** POST /api/admin/orders/{orderId}/items/cancel */
export type PostAdminOrderCancelItemsResponse = ApiResponse<AdminOrderCancelResult>;
