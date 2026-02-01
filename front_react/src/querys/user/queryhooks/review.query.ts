import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productKeys, reviewKeys } from "../keys/key";
import { deleteProductReviewRequest, getMyReviewRequest, getProductReviewRequest, postProductReviewRequest, putProductReviewRequest } from "@/apis/user";
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
            select: (data) => ({ reviewList: Array.isArray(data) ? data : [] })
        });
    },

    //쿼리: 내 리뷰 목록 조회
    useGetMyReviews(page: number, size: number) {
        return useQuery({
            queryKey: reviewKeys.myList(page, size),
            queryFn: () => getMyReviewRequest(page, size),
            placeholderData: (previousData) => previousData,
            select: (data) => ({ reviewList: Array.isArray(data) ? data : [] })
        });
    },

    //쿼리: 리뷰 생성
    usePostReview(productId: number) {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: ({ body, images }: { body: ProductReviewItem; images?: File[] | null }) => 
                postProductReviewRequest(productId, {reviewList: [body]}, images),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: reviewKeys.lists(productId) });
                queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
            },
        });
    },

    //쿼리: 리뷰 수정
    usePutReview(productId: number) {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: ({ reviewId, body, images }: { reviewId: number; body: ProductReviewUpdateRequestDto; images?: File[] | null }) => 
                putProductReviewRequest(reviewId, body, images),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: reviewKeys.lists(productId) });
            },
        });
    },

    //쿼리: 리뷰 삭제
    useDeleteReview(productId: number) {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (reviewId: number) => deleteProductReviewRequest(reviewId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: reviewKeys.lists(productId) });
                queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
            },
        });
    },

    //쿼리: 내 리뷰 삭제
    useDeleteMyReview() {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (reviewId: number) => deleteProductReviewRequest(reviewId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: reviewKeys.myLists() });
            },
        });
    },
};