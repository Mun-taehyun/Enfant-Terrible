export default interface OrderFromCartRequestDto {
    orderCode?: string;
    receiverName : string;
    receiverPhone : string;
    zipCode: string;
    addressBase: string;
    addressDetail: string | null;

    usedPoint: number; //유저의 포인트 
}