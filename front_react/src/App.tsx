import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// layouts
import AdminLayout from './layouts/admin/AdminLayout';

// auth
import Login from './auth/admin/Login';

// admin pages
import Dashboard from './pages/admin/dashboard/Dashboard';
import Categories from './pages/admin/categories/Categories';
import ProductsDisplay from './pages/admin/products/Display';
import ProductsManage from './pages/admin/products/Manage';
import ChatRooms from './pages/admin/chat/ChatRooms';
import Orders from './pages/admin/orders/Orders';
import Reviews from './pages/admin/reviews/Reviews';
import Popup from './pages/admin/popup/Popup';
import Banner from './pages/admin/banner/Banner';
import AdminMyPage from './pages/admin/account/AdminMyPage';

/* ==============================
   Auth Utils
============================== */

const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

/* ==============================
   Route Guards
============================== */

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  return <>{children}</>;
};

const LoginRoute = ({ children }: { children: React.ReactNode }) => {
  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};

/* ==============================
   App
============================== */

function App() {
  return (
    <Routes>
      {/* 루트 */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* 로그인 */}
      <Route
        path="/admin/login"
        element={
          <LoginRoute>
            <Login />
          </LoginRoute>
        }
      />

      {/* 관리자 영역 */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        {/* 첫 화면 = 대시보드 */}
        <Route index element={<Dashboard />} />

        {/* 계정 */}
        <Route path="account" element={<AdminMyPage />} />

        {/* 운영 */}
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="reviews" element={<Reviews />} />

        {/* 상품 */}
        <Route path="products/display" element={<ProductsDisplay />} />
        <Route path="products/manage" element={<ProductsManage />} />

        {/* 채팅 */}
        <Route path="chat" element={<ChatRooms />} />

        {/* 광고 */}
        <Route path="popup" element={<Popup />} />
        <Route path="banner" element={<Banner />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
