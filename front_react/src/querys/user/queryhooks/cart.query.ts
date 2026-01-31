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
            select: (data) => {
                if (data && typeof data === 'object' && Array.isArray((data as any).cartList)) {
                    return { cartList: (data as any).cartList };
                }

                if (Array.isArray(data)) {
                    return { cartList: data };
                }

                return { cartList: [] };
            },
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
            onMutate: async ({ cartItemId, requestBody }) => {
                await queryClient.cancelQueries({ queryKey: cartKeys.lists() });

                const prev = queryClient.getQueryData<any>(cartKeys.lists());

                queryClient.setQueryData(cartKeys.lists(), (old: any) => {
                    const prevList = Array.isArray(old?.cartList) ? old.cartList : [];
                    const nextList = prevList.map((it: any) =>
                        it?.cartItemId === cartItemId ? { ...it, quantity: requestBody.quantity } : it
                    );
                    return { ...(old ?? {}), cartList: nextList };
                });

                return { prev };
            },
            onError: (_err, _vars, ctx) => {
                if (ctx?.prev) {
                    queryClient.setQueryData(cartKeys.lists(), ctx.prev);
                }
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