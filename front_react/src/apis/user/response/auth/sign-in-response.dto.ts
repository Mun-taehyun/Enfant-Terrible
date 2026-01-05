export default interface SignUpResponseDto {
    accessToken: string;
    reflashToken: string;
    accessExpirationTime: number;
    reflashExpirationTime: number;
}
//엑세스 토큰 , 리프레쉬 토큰 발급 