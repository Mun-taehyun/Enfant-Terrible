export interface AdminOrder {
  orderId: number;      // 주문 고유 번호
  orderNumber: string;  // 사용자에게 보이는 주문번호 (예: ORD-20260107-001)
  ordererName: string;  // 주문자 이름
  productName: string;  // 대표 상품명 (ex: 사료 외 2건)
  totalPrice: number;   // 총 결제 금액
  status: string;       // 현재 주문 상태
  createdAt: string;    // 주문 일시
}

export interface GetAdminOrderListResponse {
  page: number;
  size: number;
  totalCount: number;   // 전체 주문 건수 (매출 대시보드 요약과 일치하는지 QA 확인 포인트)
  list: AdminOrder[];   // 실제 주문 목록 배열
}
/*
[고유 식별자] 시스템 내부에서 주문을 구별하는 ID
[가독성 번호] 고객과 상담할 때 쓰는 주문번호 
[주문자명] 주문을 한 사람의 이름
[대표 상품명] 여러 상품 주문 시 대표로 보여줄 상품명과 개수
[총 결제 금액] 모든 상품의 합산 금액
[주문 상태] 주문 진행 상황을 나타내는 상태값
[주문 일시] 주문이 생성된 날짜와 시간 

[페이지 번호] 현재 보고 있는 페이지 번호(예: 1페이지)
[페이지 크기] 한 페이지에 담긴 주문 개수 (예: 20개)
[검색 결과 총합] 필터링된 전체 주문의 개수
[실제 목록] 위에서 정의한 AdminOrder 객체들의 배열
*/ 