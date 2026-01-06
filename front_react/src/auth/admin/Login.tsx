import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ admin 전용 로그인 API
import { login } from '../../apis/admin/adminAuth.api';

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

      // 2️⃣ 로그인 API 호출 (지금은 더미 / 추후 axios)
      const response = await login({
        loginId,
        password,
      });
      
      /* 연결방식 : POST /admin/login 
      🔄 axios로 바뀌는 데이터: adminId / password/ accessToken /adminName/ role  */

      
      // 3️⃣ 토큰 저장 (Auth Guard / Interceptor 대비)
      localStorage.setItem('accessToken', response.accessToken);

      alert(`${response.adminName}님 환영합니다.`);
      navigate('/admin');
    } catch {
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
          placeholder="ID"
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
          placeholder="PASSWORD"
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
