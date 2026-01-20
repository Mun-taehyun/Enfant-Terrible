export default interface PaymentCancelRequestDto {
    paymentId: number | string; //결제 pk
    orderId: number | string;    //주문 pk
    amount: number;             //서버 검증을 위한 금액전송 
    reason: string;             //취소 사유 
}