import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AdminContainer from './containers/AdminContainer';

// admin pages
import Login from './pages/admin/Login';
import Main from './pages/admin/Main';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import ProductsDisplay from './pages/admin/products/Display';
import ProductsManage from './pages/admin/products/Manage';
import ChatRooms from './pages/admin/ChatRooms';
import UserInfo from './pages/admin/UserInfo';
import Orders from './pages/admin/Orders';
import Reviews from './pages/admin/Reviews';
import Popup from './pages/admin/Popup';
import Banner from './pages/admin/Banner';
import AdminMyPage from './pages/admin/AdminMyPage';

/* ==============================
   Auth Utils
============================== */

const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return token !== null && token !== '';
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
            <AdminContainer />
          </AdminRoute>
        }
      >
        {/* ✅ 메인 (첫 랜딩 화면) */}
        <Route index element={<Main />} />

        {/* 마이페이지 */}
        <Route path="mypage" element={<AdminMyPage />} />

        {/* 운영 */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<Categories />} />

        {/* 상품 */}
        <Route path="products/display" element={<ProductsDisplay />} />
        <Route path="products/manage" element={<ProductsManage />} />

        {/* 채팅 */}
        <Route path="chats" element={<ChatRooms />} />

        {/* 회원 */}
        <Route path="information" element={<UserInfo />} />
        <Route path="orders" element={<Orders />} />
        <Route path="reviews" element={<Reviews />} />

        {/* 광고 */}
        <Route path="popup" element={<Popup />} />
        <Route path="banner" element={<Banner />} />
      </Route>

      {/* 전체 fallback */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;