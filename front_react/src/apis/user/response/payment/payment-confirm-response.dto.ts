export default interface PaymentConfirmResponseDto {
    paymentId : number;
    orderId : number;

    paymentStatus: string; //결제 상태 응답
    paymentMethod: string; //결제 수단 
    paymentAmount: number; //승인된 결제 금액 

    pgTid: string;          //거래고유번호
    paidAt: string;         //기간
}