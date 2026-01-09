// src/apis/admin/adminorder.api.ts

import axiosInstance from '../core/api/axiosInstance'; // 경로 확인 필요 (상위로 두 번)
import type { GetAdminOrderListRequest } from './request/order/GetAdminOrderListRequest';
import type { GetAdminOrderListResponse } from './response/order/GetAdminOrderListResponse';

// 1. 함수 이름을 getOrderList로 변경 (useOrderQuery에서 이 이름으로 부르고 있음)
export const getOrderList = (params: GetAdminOrderListRequest) => {
  return axiosInstance.get<GetAdminOrderListResponse>(
    '/admin/orders',
    { params }
  );
};

// 2. updateOrderStatus 함수도 추가 (에러 방지)
export const updateOrderStatus = (orderId: number, status: string) => {
  return axiosInstance.patch(`/admin/orders/${orderId}`, { status });
};