// src/layouts/admin/adminlayout.tsx
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 토큰 없으면 관리자 로그인으로
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    // 1시간 후 자동 로그아웃
    const timer = setTimeout(() => {
      alert('1시간이 경과되어 자동 로그아웃 됩니다.');
      localStorage.removeItem('accessToken');
      navigate('/admin/login', { replace: true });
    }, 60 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
