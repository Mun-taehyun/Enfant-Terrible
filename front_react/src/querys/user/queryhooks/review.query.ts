import { useMutation, useQuery } from "@tanstack/react-query";
import { productKeys, reviewKeys } from "../keys/key";
import { deleteProductReviewRequest, getProductReviewRequest, postProductReviewRequest, putProductReviewRequest } from "@/apis/user";
import { queryClient } from "../queryClient";
import { ProductReviewUpdateRequestDto } from "@/apis/user/request/review";
import { ProductReviewItem } from "@/apis/user/request/review/product-review-create-request.dto";



export const reviewQueries = {
    //쿼리: 리뷰 목록 조회
    useGetReviews(productId: number, page: number, size: number) {
        return useQuery({
            queryKey: reviewKeys.list(productId, page, size),
            queryFn: () => getProductReviewRequest(productId, page, size),
            enabled: !!productId,
            placeholderData: (previousData) => previousData,
            //ux개선
        });
    },

    //쿼리: 리뷰 생성
    usePostReview(productId: number) {
        return useMutation({
            mutationFn: (body: ProductReviewItem) => 
                postProductReviewRequest(productId, {reviewList: [body]}),
                //감쌈으로써 사용이 편리해짐.
            onSuccess: () => {
                // 정해진 상품의 리뷰 변화 
                queryClient.invalidateQueries({ queryKey: reviewKeys.lists(productId) });
                // 상품의 변동도 요구 (평점 변화)
                queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });


                //사진여부 ? ? ?
            },
        });
    },

    //쿼리: 리뷰 수정
    usePutReview(productId: number) {
        return useMutation({
            mutationFn: ({ reviewId, body }: { reviewId: number; body: ProductReviewUpdateRequestDto }) => 
                putProductReviewRequest(reviewId, body),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: reviewKeys.lists(productId) });
            },
        });
    },

    //쿼리: 리뷰 삭제
    useDeleteReview(productId: number) {
        return useMutation({
            mutationFn: (reviewId: number) => deleteProductReviewRequest(reviewId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: reviewKeys.lists(productId) });
                queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
            },
        });
    },
};