export default interface MyOrderCancelResponseDto { 
    orderId: number;
    orderStatus: string;

    refundAmount: number;
    remainingAmount : number;
}