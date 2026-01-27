export default interface PaymentCancelResponseDto {

    paymentId : number;
    orderId : number;

    paymentStatus : string;

    pgTid : string;                     //거래 고유 번호
    cancelledAt : string;               //취소확정 시간 
}
//결제 취소 응답 dto