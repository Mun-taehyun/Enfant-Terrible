export default interface SignUpResponseDto {
    userId : number;                        //유저번호(유저 분류 기준)

    email: string;                          //이메일
    name: string;                           //실명
    tel: string;                            //전화번호
    zipCode: string;                        //우편번호
    addressBase: string;                    //주소
    addressDetail: string | null;           //상세주소(필수 입력 x)

    role: "USER";                           //유저 권한(사용자)
    status : 'ACTIVE' | 'SUSPENDED' | 'DELETED';//유저 상태(활동 여부)
}

// status 는 유저 관리로 ACTIVE(활동 중) SUSPENDED(정지 기간 중) DELETED(계정 영구 정지)