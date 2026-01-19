// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import AdminLayout from "./layouts/admin/AdminLayout";
import LoginView from "./views/admin/login.view";
import UsersView from "./views/admin/users.view";
import SalesView from "./views/admin/sales.view";
import CategoriesView from "./views/admin/categories.view.tsx"; // ✅ 추가

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
        <Route path="categories" element={<CategoriesView />} /> {/* ✅ 추가 */}
      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
