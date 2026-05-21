import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute() {
  const username = localStorage.getItem("username");
  const userEmail = localStorage.getItem("user_email");

  const admin = localStorage.getItem("admin");
  const adminId = localStorage.getItem("admin_id");

 
  if (admin && adminId) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (username && userEmail) {
    return <Navigate to="/homepage" replace />;
  }

  return <Outlet />;
}