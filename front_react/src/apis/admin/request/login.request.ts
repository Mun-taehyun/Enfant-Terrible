// src/apis/admin/request/login.request.ts

import { mainAxios } from "@/apis/admin/main_axios";

import type { ApiResponse } from "@/types/admin/api";
import type { AdminLoginRequest, AdminLoginResponse } from "@/types/admin/login";
import { unwrapOrThrow } from "../response/login.response";

export const adminSignIn = async (
  payload: AdminLoginRequest
): Promise<AdminLoginResponse> => {
  const { data } = await mainAxios.post<ApiResponse<AdminLoginResponse>>(
    "/auth/login",
    payload
  );

  return unwrapOrThrow<AdminLoginResponse>(data);
};
