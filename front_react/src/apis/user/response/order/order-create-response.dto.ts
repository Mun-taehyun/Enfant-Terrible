export default interface OrderCreateResponseDto {
    orderId : number;               //주문 pk
    orderCode : string;             //주문 코드 
    totalAmount : number;           //전체 합계금액(주문시...)
}

