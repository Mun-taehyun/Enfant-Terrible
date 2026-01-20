import OptionValue from "@/types/user/interface/option-value.interface";

export default interface DirectOrderRequestDto {
    productId : number;
    optionValueIds : OptionValue[]; 

    quantity : number;
    receiverName : string;
    receiverPhone : string;
    zipCode : string;
    addressBase : string;
    addressDetail : string | null;
}
//일반 상품 주문 요청 시 기입... 