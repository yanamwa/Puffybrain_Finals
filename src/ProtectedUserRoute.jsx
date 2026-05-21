import { Navigate, Outlet } from "react-router-dom";

function ProtectedUserRoute() {
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("user_email");

  if (!username && !email) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedUserRoute;