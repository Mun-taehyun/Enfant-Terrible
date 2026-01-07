import axiosInstance from '../core/api/axiosInstance';

import type { GetAdminProductListRequest } from './request/product/GetAdminProductListRequest';
import type { GetAdminProductListResponse } from './response/product/GetAdminProductListResponse';

export const getAdminPopupList = (
  params: GetAdminProductListRequest
) => {
  return axiosInstance.get<GetAdminProductListResponse>(
    '/admin/popups',
    { params }
  );
};