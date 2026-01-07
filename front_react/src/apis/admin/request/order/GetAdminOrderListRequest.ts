export interface GetAdminOrderListRequest {
  page: number;
  size: number;
  // 시작일이 종료일보다 늦으면 에러가 나는지 확인 필요
  startDate?: string;   // "2026-01-01"
  endDate?: string;     // "2026-01-07"
  // 주문 상태 필터: 결제대기, 결제완료, 배송중, 배송완료, 취소 등
  orderStatus?: 'PENDING' | 'PAID' | 'SHIPPING' | 'COMPLETED' | 'CANCELED';
  keyword?: string;     // 주문번호 또는 주문자명 검색
}

/*
 * 주문 목록 조회 요청
 * 주문 상태(Status) 변경에 따른 데이터 정합성과 기간 조회가 핵심 
 * [선택값] 주문 상태 필터링. 
 * [선택값] 조회 시작일 & 종료일. 
 * [선택값] 주문자명 또는 주문번호 검색.  
*/