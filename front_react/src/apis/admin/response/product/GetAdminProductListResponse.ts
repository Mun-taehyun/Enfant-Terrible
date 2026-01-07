// types/admin/product/response/GetAdminProductListResponse.ts

export interface AdminProduct {
  productId: number;
  name: string;
  price: number;
  visible: boolean;
  createdAt: string;
}

export interface GetAdminProductListResponse {
  page: number;
  size: number;
  totalCount: number;
  list: AdminProduct[];
}

/*
상품 단일 데이터 구조 AdminProduct
1,000원 단위 콤마(,) 표시 처리가 프론트에서 필요함 productId: number;
노출 여부 visible: boolean; 
등록일 (최신순 정렬 확인 시 사용) createdAt: string;

목록 전체 구조 (Wrapper) GetAdminProductListResponse
// 현재 페이지 번호 page: number;
// 페이지당 아이템 수 size: number;
// 전체 아이템 수 totalCount: number;
// 상품 목록 배열 list: AdminProduct[];
*/
