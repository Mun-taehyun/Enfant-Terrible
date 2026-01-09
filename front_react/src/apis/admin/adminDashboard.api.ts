// src/apis/admin/adminDashboard.api.ts

import axiosInstance from '../core/api/axiosInstance';
import type { GetAdminDashboardRequest } from './request/dashboard/GetAdminDashboardRequest';
import type { GetAdminDashboardResponse } from './response/dashboard/GetAdminDashboardResponse';

/* 
 * 관리자 대시보드 데이터 조회 API
 */
// 함수 이름을 getDashboardStats로 변경하고 params를 선택적(? 사용)으로 바꿉니다.
export const getDashboardStats = (
  params?: GetAdminDashboardRequest
) => {
  return axiosInstance.get<GetAdminDashboardResponse>(
    '/admin/dashboard', 
    { params }
  );
};