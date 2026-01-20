// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import AdminLayout from "./layouts/admin/AdminLayout";
import LoginView from "./views/admin/login.view";
import UsersView from "./views/admin/users.view";
import SalesView from "./views/admin/sales.view";
import CategoriesView from "./views/admin/categories.view.tsx";
import ProductsView from "./views/admin/productsView.tsx";

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

        {/* ❗ 아직 화면 없는 라우트들은 만들기 전까지 들어오면 index로 보냄 */}
        <Route path="chat" element={<Navigate to="/admin" replace />} />
        <Route path="orders" element={<Navigate to="/admin" replace />} />
        <Route path="reviews" element={<Navigate to="/admin" replace />} />
        <Route path="popup" element={<Navigate to="/admin" replace />} />
        <Route path="banner" element={<Navigate to="/admin" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
