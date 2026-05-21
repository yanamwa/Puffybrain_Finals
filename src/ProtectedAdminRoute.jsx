import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute() {
  const admin = localStorage.getItem("admin");
  const adminId = localStorage.getItem("admin_id");

  if (!admin && !adminId) {
    return <Navigate to="/pb-admin-access" replace />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;