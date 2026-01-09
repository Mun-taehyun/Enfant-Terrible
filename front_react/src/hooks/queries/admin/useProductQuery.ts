import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductList, createProduct, deleteProduct } from '@/apis/admin/adminProduct.api';

// 1. 여기서 실제 상품 리스트용 Request 타입을 정확히 가져옵니다. 
// (보통 파일명이 GetAdminProductListRequest.ts 일 것입니다.)
import type { GetAdminProductListRequest } from '@/apis/admin/request/product/GetAdminProductListRequest';

export const useProductQuery = {
  // 2. (params: Request) 대신 (params: GetAdminProductListRequest)를 사용하세요.
  // 이렇게 하면 브라우저 내장 Request 타입과 충돌하지 않습니다.
  useGetProductList: (params: GetAdminProductListRequest) => {
    return useQuery({
      queryKey: ['admin', 'products', params],
      queryFn: () => getProductList(params),
    });
  },

  useDeleteProduct: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (productId: number) => deleteProduct(productId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      },
    });
  },
  
  // 3. 'createProduct' is defined but never used 에러 해결을 위해 추가
  useCreateProduct: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: Request) => createProduct(data), // 생성에 필요한 데이터 타입으로 지정 가능
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      },
    });
  }
};