// Account 타입을 참고해서 Member용으로 새로 만듭니다.
export interface AdminMemberListRequest {
  page: number;
  size: number;
  searchType: string;
  keyword: string;
}