// ✅ export default가 있는지 확인하세요.
export default interface AdminSignInRequestDto {
  adminId: string;
  password: string;
}
/*
❝ 프론트엔드가 서버에게
“이런 형태의 JSON만 보내겠습니다”라고 약속하는 문서 ❞
adminId: 관리자 아이디
password: 관리자 비밀번호
도메인은 보안과 직접적으로 연결되는 영역이므로
추가적인 검증 로직이 백엔드에 반드시 필요하다.
*/
