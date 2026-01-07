// apis/admin/product/adminProduct.api.ts

// 상위로 두 번 이동 (apis -> src) 후 core로 진입
import axiosInstance from '../core/api/axiosInstance';

// 현재 위치(admin)에서 바로 request/response 폴더로 진입
import type { GetAdminProductListRequest } from './request/product/GetAdminProductListRequest';
import type { GetAdminProductListResponse } from './response/product/GetAdminProductListResponse';

export const getAdminProductList = (
  params: GetAdminProductListRequest
) => {
  return axiosInstance.get<GetAdminProductListResponse>(
    '/admin/products',
    { params }
  );
};