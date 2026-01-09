// src/auth/admin/Login.tsx


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ 실제 admin 로그인 API 및 타입 임포트
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

      // 2️⃣ DTO 기준 payload 생성 (adminId로 매핑)
      const payload: AdminSignInRequestDto = {
        adminId: loginId,
        password,
      };

      // 3️⃣ API 호출 (baseURL: http://localhost:8080/admin/auth/sign-in)
      const response = await adminSignIn(payload);

      // 4️⃣ 토큰 저장 (localStorage를 이용해 인터셉터에서 사용)
      localStorage.setItem('accessToken', response.accessToken);

      alert(`${response.adminId} 관리자님 환영합니다.`);
      navigate('/admin'); // 로그인 성공 시 관리자 메인으로 이동
    } catch (error) {
      console.error('Login Error:', error);
      alert('아이디 또는 비밀번호가 올바르지 않거나 서버 연결에 실패했습니다.');
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

        {/* ✅ 개선: id와 name 속성을 추가하여 접근성 경고 해결 */}
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="adminId" style={{ display: 'none' }}>Admin ID</label>
          <input
            type="text"
            id="adminId"
            name="adminId"
            placeholder="Admin ID"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* ✅ 개선: id와 name 속성을 추가하여 접근성 경고 해결 */}
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="password" style={{ display: 'none' }}>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? '로그인 중...' : 'LOGIN'}
        </button>
      </form>
    </div>
  );
};

export default Login;