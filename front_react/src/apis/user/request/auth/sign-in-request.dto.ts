export default interface SignInRequestDto {
    email: string;                          //이메일
    password: string;                       //비밀번호
    name: string;                           //실명
    tel: string;                            //전화번호
    zipCode: string;                        //우편번호
    addressBase: string;                    //주소
    addressDetail: string | null;           //상세주소
    verificationCode: number;               //인증번호 
    //여기까지가 기본 정보 


    //추가정보 기입해야함.. 
}