export default interface AdminSignInResponseDto {
  accessToken: string;
  accessTokenExpirationTime: number;
  adminId: string;
  role: 'ADMIN';
}

/* 로그인 성공 이후 프론트가 무엇을 할 수 있는지를 결정
accessToken: 서버 자원 접근 권한
refreshToken: accessToken 재발급 권한
adminId: 관리자 식별자
adminName: 관리자 이름
role: 관리자 권한 수준(규칙)
*/
