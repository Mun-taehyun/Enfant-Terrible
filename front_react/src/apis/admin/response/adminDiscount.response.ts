// src/apis/admin/response/adminDiscount.response.ts
import type { ApiResponse } from "@/types/admin/api";
import type {
  AdminProductDiscountItem,
} from "@/types/admin/discount";

/** GET /api/admin/product-discounts?productId= */
export type GetAdminProductDiscountsResponse =
  ApiResponse<AdminProductDiscountItem[]>;

/** POST /api/admin/product-discounts -> discountId */
export type CreateAdminProductDiscountResponse =
  ApiResponse<number>;

/** PUT /api/admin/product-discounts/{discountId} */
export type UpdateAdminProductDiscountResponse =
  ApiResponse<null>;

/** DELETE /api/admin/product-discounts/{discountId} */
export type DeleteAdminProductDiscountResponse =
  ApiResponse<null>;
