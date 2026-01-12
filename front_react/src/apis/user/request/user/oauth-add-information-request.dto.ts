export default interface OAuthAddInformationRequestDto {
    tel: string;
    zipCode: string;
    addressBase: string;
    addressDetail: string | null;
}
//소셜 회원가입 시 추가정보 요청  => 연동완료 