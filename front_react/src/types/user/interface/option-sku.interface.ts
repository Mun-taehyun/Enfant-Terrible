export default interface OptionSku {
    skuId : number;             //sku pk
    price : number;             //가격
    discountedPrice: number;    //할인된 가격

    stock : number;             //재고
    status: string;             //상태 

    optionValueIds: number[];     //옵션값 배열 
}//sku 설정