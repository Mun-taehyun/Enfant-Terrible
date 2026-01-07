// src/types/admin/member/useAdminMemberQuery.ts

export type MemberRole = 'USER' | 'ADMIN';
export type MemberProvider = 'LOCAL' | 'KAKAO';
export type MemberStatus = 'ACTIVE' | 'SUSPENDED';

export interface AdminMember {
  memberId: number;
  email: string;
  name: string;
  role: MemberRole;
  provider: MemberProvider;
  status: MemberStatus;
  createdAt: string;       // ISO Date
  lastSignInAt: string;    // ISO Date
}

export interface AdminMemberListResponse {
  page: number;
  size: number;
  totalCount: number;
  list: AdminMember[];
}