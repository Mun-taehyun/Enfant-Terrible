import OptionValue from "@/types/user/interface/option-value.interface";

export default interface CartItemResponseDto {
    cartList : CartItem[];
}



export interface CartItem {
    cartItemId : number;        //장바구니 pk
    skuId : number;             //sku pk
    productId : number;         //제품 pk
    productName: string;        //제품 이름
    thumbnailUrl : string;      //상품 이미지경로
    price : number;             //가격
    stock : number;             //현재 남은 재고량(사용자가 담은 수량)
    skuStatus : string;         
    //sku 상태 : 판매중 품절 판매중지 
    quantity : number;          //수량
    optionValueList : OptionValue[];   //옵션들 

    isBuyable : boolean;            //결제 가능 여부 
    buyableReason : string;         //구매 불가능 시 이유 (재고부족 등..)
}