export default interface PasswordUpdateRequestDto {
    currentPassword: string;
    newPassword: string;
}
//비밀번호 변경 요청 => 연동완료