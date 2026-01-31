import OptionValue from "@/types/user/interface/option-value.interface";

export default interface DirectOrderRequestDto {
    orderCode?: string;
    productId : number;
    optionValueIds : OptionValue[] | null; //옵션이 없을 수도 있음.  

    quantity : number;
    receiverName : string;
    receiverPhone : string;
    zipCode : string;
    addressBase : string;
    addressDetail : string | null;

    usedPoint: number;
}
//일반 상품 주문 요청 시 기입... 