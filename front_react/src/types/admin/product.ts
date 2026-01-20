// src/types/admin/product.ts
// product 관련 타입을 전부 여기로 통합합니다.

export type AdminProductId = number;
export type AdminSkuId = number;
export type AdminOptionGroupId = number;
export type AdminOptionValueId = number;

// AdminProductListRequest.status (ON_SALE / STOPPED / HIDDEN / SOLD_OUT)
export type AdminProductStatus = "ON_SALE" | "STOPPED" | "HIDDEN" | "SOLD_OUT" | string;

// SkuStatus enum (ON_SALE / SOLD_OUT / STOPPED) + 기타 확장 가능성
export type AdminSkuStatus = "ON_SALE" | "SOLD_OUT" | "STOPPED" | string;

// MyBatis AdminProductMapper selectColumns 기반
export type AdminProduct = {
  productId: AdminProductId;
  productCode: string;
  name: string;
  basePrice: number; // 백엔드는 Long이지만 프론트에서는 number로 처리
  status: AdminProductStatus;
  categoryId: number;
  categoryName: string;
  createdAt: string; // ISO string
};

// AdminProductListRequest 기반
export type AdminProductListParams = {
  page?: number; // 1부터 시작
  size?: number;
  keyword?: string;
  productCode?: string;
  status?: string;
};

// AdminProductSaveRequest 기반
export type AdminProductSavePayload = {
  productCode: string;
  categoryId: number;
  name: string;
  basePrice: number;
  status: string;
  thumbnailFileId?: number | null; // DTO에 있음
};

// MyBatis AdminProductSkuMapper selectColumns 기반
export type AdminSku = {
  skuId: AdminSkuId;
  productId: number;
  skuCode: string;
  price: number;
  stock: number;
  status: AdminSkuStatus;
  createdAt: string;

  // 백엔드 AdminSkuResponse에 포함되는지 확정 불가(현재 스펙에 없음)
  // 포함이면 활성화해서 사용하세요.
  optionValueIds?: number[];
};

// AdminSkuListRequest 기반
export type AdminSkuListParams = {
  page?: number; // 1부터 시작
  size?: number;
  productId?: number;
  status?: string;
};

// AdminSkuSaveRequest 기반 (PUT /api/admin/products/skus/{skuId}의 바디)
export type AdminSkuSavePayload = {
  productId: number;
  price: number;
  stock: number;
  status: string;
  optionValueIds?: number[]; // DTO에 있음(없어도 OK)
};

// Option Group (MyBatis 기반)
export type AdminProductOptionGroup = {
  optionGroupId: AdminOptionGroupId;
  productId: number;
  name: string;
  sortOrder: number;
  createdAt: string;
};

export type AdminProductOptionValue = {
  optionValueId: AdminOptionValueId;
  optionGroupId: AdminOptionGroupId;
  value: string;
  sortOrder: number;
};

export type AdminOptionGroupSavePayload = {
  productId: number;
  name: string;
  sortOrder: number;
};

export type AdminOptionValueSavePayload = {
  optionGroupId: number;
  value: string;
  sortOrder: number;
};
