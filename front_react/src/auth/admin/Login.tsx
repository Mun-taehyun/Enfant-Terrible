// src/auth/admin/Login.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ 실제 admin 로그인 API
import { adminSignIn } from '../../apis/admin/adminAuth.api';
import type AdminSignInRequestDto from '../../apis/admin/request/auth/admin-sign-in.request.dto';

const Login = () => {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1️⃣ 입력값 검증
    if (!loginId || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 2️⃣ DTO 기준 payload 생성
      const payload: AdminSignInRequestDto = {
        adminId: loginId,
        password,
      };

      // 3️⃣ API 호출
      const response = await adminSignIn(payload);

      // 4️⃣ 토큰 저장 (axios interceptor에서 사용)
      localStorage.setItem('accessToken', response.accessToken);

      alert(`${response.adminId} 관리자님 환영합니다.`);
      navigate('/admin');
    } catch {
      // ❗ error 미사용 → ESLint 경고 제거
      alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f6f8',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '320px',
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
          Admin Login
        </h2>

        <input
          type="text"
          placeholder="Admin ID"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '12px',
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '16px',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: '#fff',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '로그인 중...' : 'LOGIN'}
        </button>
      </form>
    </div>
  );
};

export default Login;