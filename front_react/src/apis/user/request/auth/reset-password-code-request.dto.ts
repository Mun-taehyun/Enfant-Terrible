export default interface ResetPasswordCodeRequestDto {
    email: string;
    code: string;
}
//비밀번호 재설정 시 이메일 인증번호 검증 요청