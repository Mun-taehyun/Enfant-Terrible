export default interface SignUpRequestDto {
    email: string;                          //이메일
    password: string;                       //비밀번호
    name: string;                           //실명
    tel: string;                            //전화번호
    zipCode: string;                        //우편번호
    addressBase: string;                    //주소
    addressDetail: string | null;           //상세주소
}
//유저 회원가입 요청사항 