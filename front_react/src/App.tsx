// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// 우리가 만든 것들만 import
import AdminLayout from './layouts/admin/AdminLayout';
import LoginView from './views/admin/login.view';

const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const LoginRoute = ({ children }: { children: ReactNode }) => {
  if (isAuthenticated()) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* 로그인: 우리가 만든 LoginView */}
      <Route
        path="/admin/login"
        element={
          <LoginRoute>
            <LoginView />
          </LoginRoute>
        }
      />

      {/* 관리자 레이아웃: 우리가 만든 AdminLayout(Outlet) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        {/* 지금은 대시보드 뷰가 없으니, index는 임시 문구만 */}
        <Route
          index
          element={
            <div style={{ padding: 16 }}>
              관리자 홈(임시). 다음으로 대시보드 뷰를 만들면 여기 index를 dashboard로 리다이렉트 하시면 됩니다.
            </div>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
