import axios from 'axios';
// 수정: AdminMemberSearchParams 타입을 불러옵니다.
import type {
  AdminMemberListResponse,
  MemberStatus,
  AdminMemberSearchParams,
} from '@/types/admin/member';

const api = axios.create({ baseURL: '/api' });

/**
 * 관리자 회원 목록 조회 (검색 및 페이징)
 */
export const getAdminMemberList = (params: AdminMemberSearchParams) => 
  api.get<AdminMemberListResponse>('/admin/members', { 
    params: {
      page: params.page,
      size: params.size,
      keyword: params.keyword || undefined, // 값이 없을 경우 보내지 않음
      status: params.status || undefined,
    }
  });

/**
 * 관리자 회원 상세 조회
 */
export const getAdminMemberDetail = (memberId: number) => 
  api.get(`/admin/members/${memberId}`);

/**
 * 관리자 회원 상태 변경
 */
export const patchAdminMemberStatus = (memberId: number, status: MemberStatus) => 
  api.patch(`/admin/members/${memberId}/status`, { status });