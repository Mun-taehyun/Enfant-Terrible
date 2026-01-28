import { useMutation, useQuery } from "@tanstack/react-query";
import { cartKeys } from "../keys/key";
import { deleteCartItemRequest, deleteClearCartItemRequest, getCartItemRequest, postCartItemRequest, putCartItemRequest } from "@/apis/user";
import { queryClient } from "../queryClient";


export const cartQueries = {
    //쿼리 : 장바구니 조회
    useGetItems: () => {
        const token = localStorage.getItem("accessToken")
        return useQuery({
            queryKey: cartKeys.lists(),
            queryFn: getCartItemRequest,
            enabled: !!token
        });
    },

    //쿼리 : 장바구니 아이템 추가 
    usePostItem: () => {
        return useMutation({
            mutationFn: postCartItemRequest,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: cartKeys.all });
                //장바구니에 아이템을 담았을 때 "장바구니로 이동하시겠습니까?" 고민 
            },
        });
    },

    //쿼리 : 장바구니 수량 수정 
    useUpdateItem: () => {
        return useMutation({
            mutationFn: putCartItemRequest,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: cartKeys.all });
            },
        });
    },

    //쿼리 : 장바구니 특정 아이템 삭제
    useDeleteItem: () => {
        return useMutation({
            mutationFn: deleteCartItemRequest,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: cartKeys.all });
            },
        });
    },

    //쿼리 : 장바구니 전체 비우기
    useClearCart: () => {
        return useMutation({
            mutationFn: deleteClearCartItemRequest,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: cartKeys.all });
            },
        });
    },
};