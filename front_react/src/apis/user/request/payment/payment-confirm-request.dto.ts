export default interface PaymentConfirmRequestDto {
    paymentId: string | number;
    orderId: string;
    amount: number;
}
//