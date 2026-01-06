export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  adminName: string;
}

export const login = async (
  payload: LoginRequest
): Promise<LoginResponse> => {
  const { loginId, password } = payload;

  // ✅ 더미 로그인 (현재 사용)
  if (loginId === 'admin' && password === '1234') {
    return Promise.resolve({
      accessToken: 'dummy-admin-token',
      adminName: '관리자',
    });
  }

  return Promise.reject({
    code: 'INVALID_CREDENTIALS',
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  });
};