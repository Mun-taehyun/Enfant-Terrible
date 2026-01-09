// ✅ interface 앞에 'export'가 반드시 있어야 합니다!
export default interface AdminSignInResponseDto {
  accessToken: string;
  adminId: string;
  role: string;
}
