export default interface PaymentConfirmRequestDto {
    paymentId: string | number;
    orderId: string | number;
    amount: number;
}
//