// src/apis/admin/request/adminOrder.request.ts
import { mainAxios } from "@/apis/admin/main_axios";
import type { ApiResponse } from "@/types/admin/api";
import type {
  AdminOrderListParams,
  AdminOrderListPage,
  AdminOrderDetail,
  AdminOrderStatusUpdatePayload,
  AdminOrderShippingStartPayload,
  AdminOrderCancelPayload,
} from "@/types/admin/order";

function unwrapOrThrow<T>(res: ApiResponse<T>): T {
  if (!res || res.success !== true) {
    throw new Error(res?.message || "요청에 실패했습니다.");
  }
  return res.data;
}

export async function getAdminOrders(params: AdminOrderListParams): Promise<AdminOrderListPage> {
  const { data } = await mainAxios.get<ApiResponse<AdminOrderListPage>>("/admin/orders", { params });
  return unwrapOrThrow(data);
}

export async function getAdminOrderDetail(orderId: number): Promise<AdminOrderDetail> {
  const { data } = await mainAxios.get<ApiResponse<AdminOrderDetail>>(`/admin/orders/${orderId}`);
  return unwrapOrThrow(data);
}

export async function patchAdminOrderStatus(orderId: number, body: AdminOrderStatusUpdatePayload): Promise<void> {
  const { data } = await mainAxios.patch<ApiResponse<null>>(`/admin/orders/${orderId}/status`, body);
  unwrapOrThrow(data);
}

/**
 * 배송 시작(운송장 등록) 처리
 * - types 기준 payload: AdminOrderShippingStartPayload { trackingNumber: string }
 * - 응답: ApiResponse<null> 로 처리(성공/실패만)
 */
export async function patchAdminOrderShippingStart(
  orderId: number,
  body: AdminOrderShippingStartPayload
): Promise<void> {
  const { data } = await mainAxios.patch<ApiResponse<null>>(`/admin/orders/${orderId}/shipping`, body);
  unwrapOrThrow(data);
}

/**
 * 부분취소
 * - 현재 화면은 "응답 data"를 쓰지 않고 refetch로 갱신하므로,
 *   응답은 ApiResponse<null>로 받아서 성공만 확인하면 됩니다.
 */
export async function postAdminOrderCancelItems(orderId: number, body: AdminOrderCancelPayload): Promise<void> {
  const { data } = await mainAxios.post<ApiResponse<null>>(`/admin/orders/${orderId}/items/cancel`, body);
  unwrapOrThrow(data);
}

/**
 * (선택) 기존 코드에서 patchAdminOrderShipping 이름을 이미 쓰고 있으면
 * 깨지지 않게 alias를 하나 더 제공합니다.
 */
export const patchAdminOrderShipping = patchAdminOrderShippingStart;
