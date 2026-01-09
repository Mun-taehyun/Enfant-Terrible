// Account 타입을 참고해서 Member용으로 새로 만듭니다.
// src/apis/admin/member/AdminMemberListRequest.ts

import { type MemberStatus } from '@/types/admin/member';

export interface AdminMemberListRequest {
  page: number;
  size: number;
  searchType: string;
  keyword: string;
  status: MemberStatus;
}