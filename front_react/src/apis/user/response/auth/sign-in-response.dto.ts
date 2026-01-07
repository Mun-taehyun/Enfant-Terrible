export default interface SignInResponseDto {
    accessToken: string;
    // accessExpirationTime: number;
}
//엑세스 토큰 , 리프레쉬 토큰 발급 
//로그인 응답처리 => 백엔드에서 만료시간을 정할 수 있음.