// src/apis/admin/request/dashboard/GetAdminDashboardRequest.ts

export interface GetAdminDashboardRequest {
  period: '1w' | '1m' | '3m'; 
}

/*
   * 조회 기간 설정
   * 1w: 최근 1주일
   * 1m: 최근 1달
   * 3m: 최근 3달
*/