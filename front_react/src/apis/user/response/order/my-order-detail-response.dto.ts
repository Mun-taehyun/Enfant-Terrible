export default interface MyOrderDetailResponseDto {
    orderId : number;
    orderCode : string;
    status: string;
    totalAmount: number;

    receiverName: string;
    receiverPhone: string;
    zipCode: string;
    addressBase: string;
    addressDetail: string;

    trackingNumber: string;
    orderedAt: string;
    shippedAt: string;
    deliveredAt: string|null; 
    items : MyOrderDetail[]; //상세보기의 내용물 
}

export interface MyOrderDetail {
    skuId: number;
    productName: string;
    price: number;
    quantity: number;
    cancelledQuantity: number;
    remainingQuantity: number;
}