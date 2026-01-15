// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import AdminLayout from "./layouts/admin/AdminLayout";
import LoginView from "./views/admin/login.view";
import UsersView from "./views/admin/users.view";
import SalesView from "./views/admin/sales.view";

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

      {/* 여기가 레이아웃에 뷰 넣는 곳  */}
      <Route path="/admin" element={<ProtectedAdminLayout />}>
        <Route index element={<SalesView />} />
        <Route path="sales" element={<SalesView />} />
        <Route path="users" element={<UsersView />} />
        
      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
