// src/apis/admin/response/product.response.ts

import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type {
  AdminProductListItem,
  AdminProductDetail,
  AdminSkuItem,
  AdminOptionGroupItem,
  AdminOptionValueItem,
} from "@/types/admin/product";

export type AdminVoidResponse = ApiResponse<null>;

export type GetAdminProductsResponse = ApiResponse<AdminPageResponse<AdminProductListItem>>;
export type GetAdminProductDetailResponse = ApiResponse<AdminProductDetail>;

export type GetAdminSkusResponse = ApiResponse<AdminPageResponse<AdminSkuItem>>;
export type GetAdminSkuDetailResponse = ApiResponse<AdminSkuItem>;

// option controller가 ApiResponse<?>로 내려주지만, 실제 data를 배열로 가정(서비스/mapper 구조상)
export type GetAdminOptionGroupsResponse = ApiResponse<AdminOptionGroupItem[]>;
export type GetAdminOptionValuesResponse = ApiResponse<AdminOptionValueItem[]>;
