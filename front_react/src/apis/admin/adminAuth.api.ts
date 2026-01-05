/* 관리자 인증 API */
// 실제로는 axios.post를 쓰게 될 자리

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  adminName: string;
}

// 🔹 지금은 더미 API
export const login = async (
  payload: LoginRequest
): Promise<LoginResponse> => {
  const { loginId, password } = payload;

  // 더미 관리자 계정
  if (loginId === 'admin' && password === '1234') {
    return Promise.resolve({
      accessToken: 'dummy-admin-token',
      adminName: '관리자',
    });
  }

  return Promise.reject(new Error('INVALID_CREDENTIALS'));
  
};