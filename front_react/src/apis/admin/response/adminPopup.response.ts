// src/apis/admin/response/adminPopup.response.ts

import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type { AdminPopupDetail, AdminPopupListItem } from "@/types/admin/popup";

export type GetPopupsResponse = ApiResponse<AdminPageResponse<AdminPopupListItem>>;
export type GetPopupDetailResponse = ApiResponse<AdminPopupDetail>;
export type CreatePopupResponse = ApiResponse<number>; // popupId
export type UpdatePopupResponse = ApiResponse<null>;   // ApiResponse.successMessage(...) 가 data=null로 올 수 있음
export type DeletePopupResponse = ApiResponse<null>;
