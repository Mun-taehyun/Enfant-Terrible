export default interface UserUpdateRequestDto {
    name: string;
    tel: string;
    zipCode: string;
    addressBase: string;
    addressDetail: string | null;
}
//회원 정보 수정 => 이름 전화번호 우편,주소,상세주소 수정 처리 