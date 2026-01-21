// src/types/admin/discount.ts

export type AdminProductDiscountItem = {
  discountId: number;
  productId: number;
  discountValue: number;
  discountType: string;
  startAt?: string | null;
  endAt?: string | null;
  createdAt?: string | null;
};

export type AdminProductDiscountSavePayload = {
  productId: number;
  discountValue: number;
  discountType: string;
  startAt?: string | null;
  endAt?: string | null;
};
