// src/apis/admin/adminAuth.api.ts

import axiosInstance from '../core/api/axiosInstance';
import type AdminSignInRequestDto from './request/auth/admin-sign-in.request.dto';
import type AdminSignInResponseDto from './response/auth/admin-sign-in.response.dto';

export const adminSignIn = async (
  requestBody: AdminSignInRequestDto
): Promise<AdminSignInResponseDto> => {
  const response = await axiosInstance.post<AdminSignInResponseDto>(
    '/admin/auth/sign-in',
    requestBody
  );

  return response.data;
};