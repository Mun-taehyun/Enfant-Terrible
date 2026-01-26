import { useMutation, useQuery } from "@tanstack/react-query";
import { inquiryKeys } from "../keys";
import { queryClient } from "../queryClient";
import { deleteProductInquiriesRequest, getProductInquiriesRequest, postProductInquiriesRequest } from "@/apis/user";




export const useInquiryQueries = {
    // 문의 조회
    useGetInquiries: (productId: number, page: number, size: number) => {
        return useQuery({
            queryKey: inquiryKeys.list(productId, page, size),
            // 이미 정의하신 함수를 그대로 꽂아넣기!
            queryFn: () => getProductInquiriesRequest(productId, page, size),
            enabled: !!productId,
        });
    },

    // 문의 등록
    usePostInquiry: (productId: number) => {
        return useMutation({
            mutationFn: () => postProductInquiriesRequest(productId),
            onSuccess: () => {
                // 등록 성공 시 목록 새로고침
                queryClient.invalidateQueries({ queryKey: inquiryKeys.lists(productId) });
            },
        });
    },

    // 문의 삭제
    useDeleteInquiry: (productId: number) => {
        return useMutation({
            mutationFn: (inquiryId: number) => deleteProductInquiriesRequest(inquiryId),
            onSuccess: () => {
                // 삭제 성공 시 목록 새로고침
                queryClient.invalidateQueries({ queryKey: inquiryKeys.lists(productId) });
            },
        });
    }

};