export default interface PaymentConfirmRequestDto {
    paymentId: string | number;
    orderCode: string;
    amount: number;
}
//