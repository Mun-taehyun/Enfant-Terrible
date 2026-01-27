// src/views/admin/login/login.view.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./login.view.module.css";
import { adminSignIn } from "@/apis/admin/request/login.request";
import type { AdminLoginRequest } from "@/types/admin/login";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (isObject(e) && typeof e.message === "string") return e.message;
  return "아이디 또는 비밀번호가 올바르지 않거나 서버 연결에 실패했습니다.";
}

const LoginView = () => {
  const navigate = useNavigate();

  // ✅ 백 스펙: email/password
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      window.alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const payload: AdminLoginRequest = {
        email: email.trim(),
        password,
      };

      const data = await adminSignIn(payload);

      // ✅ 백 스펙: accessToken/refreshToken 저장
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // ✅ 응답에 adminId가 없으므로, 화면 입력값(email)로 처리
      window.alert(`${email.trim()} 관리자님 환영합니다.`);
      navigate("/admin", { replace: true });
    } catch (error: unknown) {
      console.error("Login Error:", error);
      window.alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Admin Login</h2>

        <div className={styles.field}>
          <label className={styles.srOnly} htmlFor="email">
            Email
          </label>
          <input
            className={styles.input}
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.srOnly} htmlFor="password">
            Password
          </label>
          <input
            className={styles.input}
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "LOGIN"}
        </button>
      </form>
    </div>
  );
};

export default LoginView;
