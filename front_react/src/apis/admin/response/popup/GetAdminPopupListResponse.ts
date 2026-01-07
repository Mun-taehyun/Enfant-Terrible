// types/admin/popup/response/GetAdminPopupListResponse.ts

export interface AdminPopup {
  popupId: number;
  title: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

export interface GetAdminPopupListResponse {
  page: number;
  size: number;
  totalCount: number;
  list: AdminPopup[];
}

/*
팝업 단일 데이터 구조
수정/삭제 시 필요한 고유 키 (Primary Key) popupId: number;
팝업 제목 title: string;
팝업 활성화 상태 active: boolean;
팝업 노출 시작일 startDate: string;
팝업 노출 종료일 endDate: string; 

목록 전체 구조 (Wrapper) GetAdminPopupListResponse
// 현재 보고 있는 페이지 (예: 1페이지) page: number;
// 한 페이지당 보여주는 아이템 수 size: number;
// 전체 아이템 수 totalCount: number;
// 팝업 목록 배열 list: AdminPopup[];
*/ 