import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartKeys, orderKeys, paymentKeys, pointKeys } from "../keys/key";
import { PaymentCancelRequestDto, PaymentConfirmRequestDto } from "@/apis/user/request/payment";
import { postPaymentsCancelRequest, postPaymentsConfirmRequest } from "@/apis/user";


//장바구니 , 주문목록 , 포인트 잔액 무효화 고민 필수  


export const paymentQueries = {


    //쿼리 : 결제 시도
    usePostPaymentConfirm() {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (body: PaymentConfirmRequestDto) => postPaymentsConfirmRequest(body),
            onSuccess: () => {
                //장바구니 
                queryClient.invalidateQueries({ queryKey: cartKeys.all });
                
                //주문목록 /갱신하기 
                queryClient.invalidateQueries({ queryKey: orderKeys.all }); 

                //포인트
                queryClient.invalidateQueries({ queryKey: pointKeys.all });
                
                //결제내역 갱신
                queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            }
        });
    },

    //쿼리 : 결제 취소
    usePostPaymentCancel() {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (body: PaymentCancelRequestDto) => postPaymentsCancelRequest(body),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: orderKeys.all });
                queryClient.invalidateQueries({ queryKey: pointKeys.all });
                queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            }
        });
    }
};