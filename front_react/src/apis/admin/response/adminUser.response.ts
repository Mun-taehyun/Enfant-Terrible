// src/apis/admin/response/adminUser.response.ts

import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type { AdminUserDetail, AdminUserListItem } from "@/types/admin/user";

export type GetUsersResponse = ApiResponse<AdminPageResponse<AdminUserListItem>>;
export type GetUserDetailResponse = ApiResponse<AdminUserDetail>;
export type PatchUserStatusResponse = ApiResponse<null>;
