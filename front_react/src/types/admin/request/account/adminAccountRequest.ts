//types\admin\request\account\adminaccountrequest.ts


import type { MemberStatus } from '@/components/common/codes';

export interface AdminAccountListRequest {
  page: number;          // 기본 1
  size: number;          // 기본 20
  email?: string;
  name?: string;
  status?: MemberStatus;
  provider?: 'LOCAL' | 'KAKAO' | 'NAVER' | 'GOOGLE';
  createdFrom?: string;   // YYYY-MM-DD
  createdTo?: string;     // YYYY-MM-DD
}