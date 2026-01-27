// src/views/admin/login/login.view.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './login.view.module.css';
import { adminSignIn } from '@/apis/admin/request/login.request';
import type { AdminLoginRequest } from '@/types/admin/login';

const LoginView = () => {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loginId || !password) {
      window.alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      const payload: AdminLoginRequest = {
        adminId: loginId,
        password,
      };

      // ✅ 여기만 고치면 됩니다: adminLogin -> adminSignIn
      const data = await adminSignIn(payload);

      // ✅ adminSignIn이 "unwrapOrThrow" 방식이면 success/message가 아니라 data만 옵니다.
      localStorage.setItem('accessToken', data.accessToken);
      window.alert(`${data.adminId} 관리자님 환영합니다.`);
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Login Error:', error);
      window.alert('아이디 또는 비밀번호가 올바르지 않거나 서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Admin Login</h2>

        <div className={styles.field}>
          <label className={styles.srOnly} htmlFor="adminId">Admin ID</label>
          <input
            className={styles.input}
            type="text"
            id="adminId"
            name="adminId"
            placeholder="Admin ID"
            value={loginId}
            onChange={e => setLoginId(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.srOnly} htmlFor="password">Password</label>
          <input
            className={styles.input}
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? '로그인 중...' : 'LOGIN'}
        </button>
      </form>
    </div>
  );
};

export default LoginView;
