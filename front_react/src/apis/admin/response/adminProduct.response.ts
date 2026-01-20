// src/apis/admin/response/product.response.ts

import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type { AdminProduct, AdminSku, AdminProductOptionGroup, AdminProductOptionValue } from "@/types/admin/product";

export type AdminVoidResponse = ApiResponse<null>;

export type GetAdminProductsResponse = ApiResponse<AdminPageResponse<AdminProduct>>;
export type GetAdminProductDetailResponse = ApiResponse<AdminProduct>;

export type GetAdminSkusResponse = ApiResponse<AdminPageResponse<AdminSku>>;
export type GetAdminSkuDetailResponse = ApiResponse<AdminSku>;

// option controller가 ApiResponse<?>로 내려주지만, 실제 data를 배열로 가정(서비스/mapper 구조상)
export type GetAdminOptionGroupsResponse = ApiResponse<AdminProductOptionGroup[]>;
export type GetAdminOptionValuesResponse = ApiResponse<AdminProductOptionValue[]>;
