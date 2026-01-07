// types/admin/popup/request/GetAdminPopupListRequest.ts
export interface GetAdminPopupListRequest {
  page: number;
  size: number;
  active?: boolean;
}

/*
 * 팝업 목록 조회 요청
 * '전체' 뿐만 아니라 '활성화/비활성화' 상태별 노출 테스트가 필요함
 *  현재 몇 페이지인지 (0부터 시작인지 1부터인지 서버와 협의 필수) page: number; 
 *  페이지당 몇 개의 아이템을 보여줄지 size: number;
 *  활성화 상태 필터 (선택 사항) active?: boolean;
 */