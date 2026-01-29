// src/apis/admin/request/adminDiscount.request.ts
import { mainAxios } from "@/apis/admin/main_axios";
import type { ApiResponse } from "@/types/admin/api";
import type {
  AdminProductDiscountItem,
  AdminProductDiscountSavePayload,
} from "@/types/admin/discount";

/**
 * 기존 adminProduct.request.ts와 동일한 전제로 작성:
 * - 서버 응답은 ApiResponse<T>
 * - 여기서 "data"만 반환(unwrap)해서 query/view가 detailQ.data 형태로 사용 가능
 */

function unwrapOrThrow<T>(res: ApiResponse<T>): T {
  if (!res?.success) throw new Error(res?.message || "요청에 실패했습니다.");
  return res.data;
}

/** GET /api/admin/product-discounts?productId= */
export async function getAdminProductDiscounts(productId: number) {
  const r = await mainAxios.get<ApiResponse<AdminProductDiscountItem[]>>(
    "/admin/product-discounts",
    { params: { productId } }
  );
  return unwrapOrThrow(r.data);
}

/** POST /api/admin/product-discounts -> ApiResponse<Long(discountId)> */
export async function createAdminProductDiscount(payload: AdminProductDiscountSavePayload) {
  const r = await mainAxios.post<ApiResponse<number>>(
    "/admin/product-discounts",
    payload
  );
  return unwrapOrThrow(r.data);
}

/** PUT /api/admin/product-discounts/{discountId} */
export async function updateAdminProductDiscount(
  discountId: number,
  payload: AdminProductDiscountSavePayload
) {
  const r = await mainAxios.put<ApiResponse<null>>(
    `/admin/product-discounts/${discountId}`,
    payload
  );
  return unwrapOrThrow(r.data);
}

/** DELETE /api/admin/product-discounts/{discountId} */
export async function deleteAdminProductDiscount(discountId: number) {
  const r = await mainAxios.delete<ApiResponse<null>>(
    `/admin/product-discounts/${discountId}`
  );
  return unwrapOrThrow(r.data);
}
