export default interface SignInResponseDto {
    accessToken: string;
    accessExpirationTime: number;
}
//엑세스 토큰 , 리프레쉬 토큰 발급 