// import axios from 'axios'; // STEP 2에서 사용 예정
/* axios는 백엔드 연동 시점에 사용 예정 */
// import axios from 'axios';
/* =========================
   요청 / 응답 타입
========================= */

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  adminName: string;
  // role?: 'ADMIN'; // ⬅️ 추후 권한 분기 대비
}

/* =========================
   관리자 로그인 API
========================= */

export const login = async (
  payload: LoginRequest
): Promise<LoginResponse> => {
  const { loginId, password } = payload;

  /* --------------------------------------------------
   ✅ [STEP 1] 더미 로그인 (현재 사용 중)
   -------------------------------------------------- */
  if (loginId === 'admin' && password === '1234') {
    return Promise.resolve({
      accessToken: 'dummy-admin-token',
      adminName: '관리자',
      // role: 'ADMIN',
    });
  }

  return Promise.reject({
    code: 'INVALID_CREDENTIALS',
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  });

  /* --------------------------------------------------
   🚀 [STEP 2] 실제 axios 로그인 (백엔드 준비 후)
   --------------------------------------------------

  try {
    const response = await axios.post<LoginResponse>(
      '/admin/login',
      payload
    );

    return response.data;
  } catch (error: any) {
    // ❗ 여기서는 UI 처리 금지 (alert ❌)
    // ❗ 에러는 던지고, 컴포넌트에서 처리
    throw error;
  }

  -------------------------------------------------- */
};