// src/apis/admin/adminDashboard.api.ts

import axiosInstance from '../core/api/axiosInstance';
import type { GetAdminDashboardRequest } from './request/dashboard/GetAdminDashboardRequest';
import type { GetAdminDashboardResponse } from './response/dashboard/GetAdminDashboardResponse';

/**
 * 관리자 대시보드 매출 데이터 조회 API
 */
export const getAdminDashboard = (
  params: GetAdminDashboardRequest
) => {
  return axiosInstance.get<GetAdminDashboardResponse>(
    '/admin/dashboard', 
    { params }
  );
};