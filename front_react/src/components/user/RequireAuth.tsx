import { AUTH_LOGIN_PATH, AUTH_PATH } from "@/constant/user/route.index";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");

  if (!token) {
    const from = location.pathname + location.search;
    return (
      <Navigate
        to={AUTH_PATH() + AUTH_LOGIN_PATH()}
        replace
        state={{ from }}
      />
    );
  }

  return <Outlet />;
}
