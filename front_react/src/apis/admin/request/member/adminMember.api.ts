// src/apis/admin/member/adminMember.api.ts

import axiosInstance from '@/apis/core/api/axiosInstance'; 
import type { AdminMemberListRequest } from '@/apis/admin/request/member/adminMemberRequest';
import type { MemberStatus } from '@/components/common/codes';

/**
 * ✅ 관리자 회원 목록 조회
 */
export const getAdminMemberList = async (params: AdminMemberListRequest) => {
  // 인스턴스 이름 그대로 사용
  const { data } = await axiosInstance.get('/admin/members', { params });
  return data;
};

/**
 * ✅ 관리자 회원 상세 조회
 */
export const getAdminMemberDetail = async (userId: number) => {
  const { data } = await axiosInstance.get(`/admin/members/${userId}`);
  return data;
};

/**
 * ✅ 관리자 회원 상태 변경
 */
export const patchAdminMemberStatus = async (userId: number, status: MemberStatus) => {
  const { data } = await axiosInstance.patch(`/admin/members/${userId}/status`, { status });
  return data;
};