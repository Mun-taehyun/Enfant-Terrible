import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../queryClient";
import { DirectOrderRequestDto, GetOrderParamRequestDto, MyOrderCancelRequestDto, OrderFromCartRequestDto } from "@/apis/user/request/order";
import { getOrderMyDetailRequest, getOrderMyRequest, getOrderPrepareDirectRequest, getOrderPrepareFromCartRequest, postOrderDirectRequest, postOrderFromCartRequest, postOrderMyCancelRequest } from "@/apis/user";
import { orderKeys } from "../keys/key";

export const orderQueries = {

    //쿼리 : 장바구니 주문 사전조회
    useGetOrderPrepareFromCart() {
        return useQuery({
            queryKey: orderKeys.prepare('cart'),
            queryFn: () => getOrderPrepareFromCartRequest(),
        });
    },

    //쿼리 : 바로구매 주문 사전조회
    useGetOrderPrepareDirect(params: GetOrderParamRequestDto) {
        return useQuery({
            queryKey: orderKeys.prepare('direct', params),
            queryFn: () => getOrderPrepareDirectRequest(params),
            enabled: Number.isFinite(params.productId) && params.productId > 0,
        });
    },

    //쿼리 : 장바구니에서 주문 생성
    usePostOrderFromCart() {
        return useMutation ({
            mutationFn: (data: OrderFromCartRequestDto) => postOrderFromCartRequest(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['carts'] }); 
                queryClient.invalidateQueries({ queryKey: orderKeys.all });
            },
        });
    },

    //쿼리 : 바로구매 주문 생성
    usePostOrderDirect() {
        return useMutation({
            mutationFn: (data: DirectOrderRequestDto) => postOrderDirectRequest(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: orderKeys.all });
            },
        });
    },

    //쿼리 : 내 주문 목록 조회
    useGetOrderMy(page: number, size: number) {
        return useQuery({
            queryKey: orderKeys.myList(page, size),
            queryFn: () => getOrderMyRequest(page, size),
        });
    },

    //쿼리 : 내 주문 상세 조회
    useGetOrderMyDetail(orderId: number) {
        return useQuery({
            queryKey: orderKeys.detail(orderId),
            queryFn: () => getOrderMyDetailRequest(orderId),
            enabled: !!orderId,
        });
    },

    //쿼리 : 내 주문 취소
    usePostOrderMyCancel() {
        return useMutation({
            mutationFn: ({ orderId, requestBody }: { orderId: number; requestBody: MyOrderCancelRequestDto }) => 
                postOrderMyCancelRequest(orderId, requestBody),
            onSuccess: (variables) => {
                //주문내용 소거
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
                //리스트에도 소거 
                queryClient.invalidateQueries({ queryKey: orderKeys.myLists() });
            },
        });
    }
};