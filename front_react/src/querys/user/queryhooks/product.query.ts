import { GetProductListRequestDto } from "@/apis/user/request/product";
import { useQuery } from "@tanstack/react-query";
import { productKeys } from "../keys";
import { getProductDetailRequest, getProductListRequest } from "@/apis/user";

export const productQueries = {
    // ======================== R(조회) ========================

    useProductList(params: GetProductListRequestDto) {
        return useQuery({
            queryKey: productKeys.list(params),
            queryFn: () => getProductListRequest(params),
        });
    },

    useProductDetail(productId: number) {
        return useQuery({
            queryKey: productKeys.detail(productId),
            queryFn: () => getProductDetailRequest(productId),
            enabled: !!productId, // ID가 있을 때만 실행
        });
    },
};