export default interface AdminSignInRequestDto {
  adminId: string;
  password: string;
}
/*
❝ 프론트엔드가 서버에게
“이런 형태의 JSON만 보내겠습니다”라고 약속하는 문서 ❞
adminId: 관리자 아이디
password: 관리자 비밀번호
*/
