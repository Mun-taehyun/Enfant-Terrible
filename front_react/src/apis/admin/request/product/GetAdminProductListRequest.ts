// types/admin/product/request/GetAdminProductListRequest.ts
export interface GetAdminProductListRequest {
  page: number;
  size: number;
  keyword?: string;
  visible?: boolean;
}

/*상품 목록 조회 요청
 검색어(keyword) 입력 시 부분 일치 검색이 잘 되는지가 핵심
 
 [선택값] 상품명 검색. 빈 값(empty)일 때 전체 조회되는지 확인 keyword?: string;
 [선택값] 진열 상태 필터링 (사용자에게 보이는 상품인가?) visible?: boolean;
 */