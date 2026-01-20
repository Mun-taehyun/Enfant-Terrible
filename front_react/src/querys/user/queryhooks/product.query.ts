import { GetProductListRequestDto } from "@/apis/user/request/product";
import { useQuery } from "@tanstack/react-query";
import { productKeys } from "../keys";
import { getProductDetailRequest, getProductListRequest, getProductSkuResolveRequest } from "@/apis/user";

export const productQueries = {

    //쿼리 : 상품 리스트 조회
    useProductList(params: GetProductListRequestDto) {
        return useQuery({
            queryKey: productKeys.list(params),
            queryFn: () => getProductListRequest(params),
            select: (data) => data.productList,
        });
    },

    //쿼리 : 상품 상세 조회
    useProductDetail(productId: number) {
        return useQuery({
            queryKey: productKeys.detail(productId),
            queryFn: () => getProductDetailRequest(productId),
            enabled: typeof productId === 'number' && !isNaN(productId),
            //product number or 
        });
    },


    //쿼리 : 상품 sku 조회 
    useProductSkuResolve(productId: number, optionValueIds: number[]) {
        return useQuery({
            queryKey: productKeys.sku(productId, optionValueIds),
            queryFn: () => getProductSkuResolveRequest(productId, optionValueIds),
            enabled: !!productId
            //조건 productId가 존재해야만 실행. 
        });
    }
};