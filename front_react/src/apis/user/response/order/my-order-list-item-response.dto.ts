export default interface MyOrderListItemResponseDto {
    page: number;
    size: number;
    totalCount: number;
    items: MyOrderListItem[]; //주문내역을 보여주기 위한 리스트.. 
}





export interface MyOrderListItem {
    orderId : number;
    orderCode : string;
    status: string;
    totalAmount: number;
    representativeProductName: string;
    representativeThumbnailUrl: string;
    trackingNumber: string;
    orderedAt: string;
    shippedAt: string;
    deliveredAt: string|null;
}


//   ORDERED,               //주문접수
//   PAYMENT_PENDING,       //결제대기
//   PAID,                  //결제완료
//   PARTIALLY_CANCELLED,   //부분취소
//   SHIPPING,              //배송중
//   DELIVERED,             //배송완료
//   CANCELLED;             //주문취소