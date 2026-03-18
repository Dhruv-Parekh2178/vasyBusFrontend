import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;