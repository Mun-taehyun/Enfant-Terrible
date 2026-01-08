export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';

export interface Member {
  id: number;
  name: string;
  email: string;
  status: MemberStatus;
  createdAt: string;
}

// 추가: 검색 파라미터 정의
export interface AdminMemberSearchParams {
  page: number;
  size: number;
  keyword: string;
  status: MemberStatus;
}

export interface AdminMemberListResponse {
  content: Member[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

/*데이터의 구조를 정의합니다. API 파일에서 임포트하여 사용 */