// src/types/admin/product.ts
import type { AdminPageResponse } from "@/types/admin/api";

/* ===== Products ===== */

export type AdminProductListParams = {
  page: number;
  size: number;
  status?: string;
  keyword?: string;
  productCode?: string;
};

export type AdminProductListItem = {
  productId: number;
  productCode: string;
  name: string;
  basePrice: number;
  status: string;
  categoryId: number | string | null;
  categoryName: string;
  createdAt: string;
};

export type AdminProductImageItem = {
  fileId: number;
  fileUrl: string;
  originalName?: string | null;
  sortOrder?: number | null;
};

export type AdminProductDetail = {
  productId: number;
  productCode: string;

  name: string;
  description?: string | null;
  basePrice: number;
  status: string;

  categoryId: number | string | null;
  categoryName: string;

  createdAt: string;
  images?: AdminProductImageItem[];
};

export type AdminProductSavePayload = {
  productCode: string;
  categoryId: number;
  name: string;
  description?: string | null;
  basePrice: number;
  status: string;
  thumbnailFileId?: number | null; // 프론트 폼에 존재
};

/* ===== SKUs ===== */

export type AdminSkuListParams = {
  page: number;
  size: number;
  productId: number;
  status?: string;
};

export type AdminSkuItem = {
  skuId: number;
  productId: number;
  skuCode: string;
  price: number;
  stock: number;
  status: string;
  createdAt: string;
  optionValueIds?: number[];
};

export type AdminSkuSavePayload = {
  productId: number;
  price: number;
  stock: number;
  status: string;
  optionValueIds?: number[];
};

/* ===== Option Groups / Values ===== */

export type AdminOptionGroupItem = {
  optionGroupId: number;
  productId: number;
  name: string;
  sortOrder: number;
  createdAt?: string;
};

export type AdminOptionGroupSavePayload = {
  productId: number;
  name: string;
  sortOrder: number;
};

export type AdminOptionGroupReorderPayload = {
  productId: number;
  orderedGroupIds: number[];
};

export type AdminOptionValueItem = {
  optionValueId: number;
  optionGroupId: number;
  value: string;
  sortOrder: number;
  createdAt?: string;
};

export type AdminOptionValueSavePayload = {
  optionGroupId: number;
  value: string;
  sortOrder: number;
};

export type AdminOptionValueReorderPayload = {
  optionGroupId: number;
  orderedValueIds: number[];
};

/* (참고) 페이지 응답 타입 alias가 필요하면 */
export type AdminProductPage = AdminPageResponse<AdminProductListItem>;
export type AdminSkuPage = AdminPageResponse<AdminSkuItem>;
