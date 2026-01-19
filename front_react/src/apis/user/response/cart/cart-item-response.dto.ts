import OptionValue from "@/types/user/interface/option-value.interface";

export default interface CartItemResponseDto {
    cartItemId : number;
    skuId : number;
    productId : number;
    productName: string;
    thumbnailUrl : string;
    price : number;
    stock : number;
    skuStatus : string;
    //sku 상태 : 판매중 품절 판매중지 
    optionValueList : OptionValue[];
}