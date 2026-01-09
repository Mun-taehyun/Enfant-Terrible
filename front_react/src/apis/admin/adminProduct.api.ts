// src/apis/admin/adminProduct.api.ts

import axiosInstance from '@/apis/core/api/axiosInstance';
// 1. 실제 요청/응답 타입을 가져옵니다.
import type { GetAdminProductListRequest } from './request/product/GetAdminProductListRequest';

/** 상품 목록 조회 */
export const getProductList = (params: GetAdminProductListRequest) => {
  // 인자로 GetAdminProductListRequest 타입을 받는다고 확실히 명시합니다.
  return axiosInstance.get('/admin/products', { params });
};

/** 상품 생성 (data 타입을 any 대신 실제 생성 객체 타입으로 지정하세요) */
export const createProduct = (data: unknown) => { // any 대신 unknown 사용 시 더 안전함
  return axiosInstance.post('/admin/products', data);
};

/** 상품 삭제 */
export const deleteProduct = (productId: number) => {
  return axiosInstance.delete(`/admin/products/${productId}`);
};