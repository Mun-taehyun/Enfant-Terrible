// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import AdminLayout from "./layouts/admin/AdminLayout";
import LoginView from "./views/admin/login.view";
import UsersView from "./views/admin/users.view";
import SalesView from "./views/admin/sales.view";
import CategoriesView from "./views/admin/categories.view.tsx";
import ProductsView from "./views/admin/productsView.tsx";
import QnaMessagesView from "./views/admin/QnaMessagesView.tsx";
import QnaRoomsView from "./views/admin/QnaRoomsView.tsx";

// ✅ 추가: 관리자 신규 메뉴(백엔드 컨트롤러 존재)
import PaymentsView from "@/views/admin/payments.view";
import PostsView from "@/views/admin/posts.view";
import PopupsView from "@/views/admin/popups.view";
import BannersView from "@/views/admin/banners.view";

const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
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

const ProtectedAdminLayout = () => {
  return (
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      <Route
        path="/admin/login"
        element={
          <LoginRoute>
            <LoginView />
          </LoginRoute>
        }
      />

      <Route path="/admin" element={<ProtectedAdminLayout />}>
        <Route index element={<SalesView />} />
        <Route path="sales" element={<SalesView />} />

        <Route path="users" element={<UsersView />} />
        <Route path="categories" element={<CategoriesView />} />
        <Route path="products" element={<ProductsView />} />

        <Route path="payments" element={<PaymentsView />} />
        <Route path="posts" element={<PostsView />} />
        <Route path="popups" element={<PopupsView />} />
        <Route path="banners" element={<BannersView />} />

        <Route path="qna" element={<QnaRoomsView />} />
        <Route path="qna/:roomId" element={<QnaMessagesView />} />
        
        <Route path="orders" element={<Navigate to="/admin" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
