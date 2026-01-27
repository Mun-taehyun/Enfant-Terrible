export default interface GetOrderParamRequestDto {
    productId: number;
    optionValueIds: number[] | null; //id만 배열로 받아야하는 상황.. 
    quantity: number;
}//option은 옵션 여부에 따라.... 