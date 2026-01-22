export default interface OrderFromCartRequestDto {
    receiverName : string;      //받는사람 이름
    receiverPhone : string;     //받는사람 폰 번호
    zipCode: string;            //우편번호 
    addressBase: string;        //집 주소
    addressDetail: string | null;      //집 상세주소
}//장바구니 주문 요청 .. 