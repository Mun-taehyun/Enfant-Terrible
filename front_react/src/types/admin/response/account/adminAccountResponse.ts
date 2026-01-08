import type { MemberStatus } from '@/components/common/codes';

/**
 * 관리자 - 사용자 목록 아이템
 */
export interface AdminUserListItem {
  userId: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  status: MemberStatus;
  provider: 'LOCAL' | 'KAKAO' | 'NAVER' | 'GOOGLE';
  createdAt: string;   // ISO DateTime
  lastLoginAt: string; // ISO DateTime
}

/**
 * 관리자 - 사용자 목록 조회 응답
 */
export interface AdminAccountListResponse {
  page: number;
  size: number;
  totalCount: number;
  list: AdminUserListItem[];
}

/**
 * 관리자 - 사용자 상세 조회 응답
 */
export interface AdminAccountDetailResponse {
  userId: number;
  email: string;
  name: string;
  tel: string;
  role: 'USER' | 'ADMIN';
  status: MemberStatus;
  provider: 'LOCAL' | 'KAKAO' | 'NAVER' | 'GOOGLE';
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  pets: unknown[]; // 추후 Pet 타입 정의 시 교체
}