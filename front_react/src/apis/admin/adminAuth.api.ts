// apis/admin/adminAuth.api.ts

import axiosInstance from '../core/api/axiosInstance';

import type AdminSignInRequestDto from './request/auth/admin-sign-in.request.dto';
import type AdminSignInResponseDto from './response/auth/admin-sign-in.response.dto';
/**
 * 관리자 로그인
 * POST /api/admin/auth/sign-in
 */
export const adminSignIn = async (
  payload: AdminSignInRequestDto
): Promise<AdminSignInResponseDto> => {
  const response = await axiosInstance.post<AdminSignInResponseDto>(
    '/admin/auth/sign-in',
    payload
  );

  return response.data;
};