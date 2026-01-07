import axios from 'axios';

// ==============================
// type imports (DTO)
// ==============================
import type {CategoryListRequest}
  from './request/category/CategoryListRequest.ts';

import type { CreateCategoryRequest }
  from './request/category/CreateCategoryRequest.ts';

import type { UpdateCategoryRequest }
  from './request/category/UpdateCategoryRequest.ts';

import type { ChangeCategoryStatusRequest }
  from './request/category/ChangeCategoryStatusRequest.ts';

import type { CategoryListResponse }
  from './response/category/CategoryListResponse.ts';

import type { CategoryDetailResponse }
  from './response/category/CategoryDetailResponse.ts';

// ==============================
// admin axios instance
// ==============================
const adminAxios = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==============================
// API functions
// ==============================

/**
 * 카테고리 목록 조회
 */
export const getCategoryList = async (
  params?: CategoryListRequest
): Promise<CategoryListResponse[]> => {
  const response = await adminAxios.get<CategoryListResponse[]>(
    '/categories',
    { params }
  );
  return response.data;
};

/**
 * 카테고리 상세 조회
 */
export const getCategoryDetail = async (
  categoryId: number
): Promise<CategoryDetailResponse> => {
  const response = await adminAxios.get<CategoryDetailResponse>(
    `/categories/${categoryId}`
  );
  return response.data;
};

/**
 * 카테고리 생성
 */
export const createCategory = async (
  data: CreateCategoryRequest
): Promise<void> => {
  await adminAxios.post('/categories', data);
};

/**
 * 카테고리 정보 수정
 */
export const updateCategory = async (
  categoryId: number,
  data: UpdateCategoryRequest
): Promise<void> => {
  await adminAxios.put(`/categories/${categoryId}`, data);
};

/**
 * 카테고리 활성 / 비활성 상태 변경
 */
export const changeCategoryStatus = async (
  categoryId: number,
  data: ChangeCategoryStatusRequest
): Promise<void> => {
  await adminAxios.patch(`/categories/${categoryId}/status`, data);
};