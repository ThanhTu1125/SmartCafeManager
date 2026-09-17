import { Navigate } from "react-router-dom";
import { getHomePath } from "../utils/authRedirect";

export default function RequireRole({ roles = [], children }) {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("roleName") || "").toUpperCase();
  const allowed = roles.map((r) => r.toUpperCase());

  if (!token) return <Navigate to="/" replace />;
  if (allowed.length > 0 && !allowed.includes(role)) {
    return <Navigate to={getHomePath()} replace />;
  }

  return children;
}
