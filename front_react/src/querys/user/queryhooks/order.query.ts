import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../queryClient";
import { DirectOrderRequestDto, OrderFromCartRequestDto } from "@/apis/user/request/order";
import { postOrderDirectRequest, postOrderFromCartRequest } from "@/apis/user";
import { orderKeys } from "../keys/key";

export const orderQueries = {

    //쿼리 : 장바구니에서 주문
    usePostOrderFromCart() {
        return useMutation({
            mutationFn: (data: OrderFromCartRequestDto) => postOrderFromCartRequest(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['carts'] }); 
                queryClient.invalidateQueries({ queryKey: orderKeys.all });
            },
        });
    },

    //쿼리 : 즉시 주문하는 쿼리 
    usePostOrderDirect() {
        return useMutation({
            mutationFn: (data: DirectOrderRequestDto) => postOrderDirectRequest(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: orderKeys.all });
            },
        });
    }
};