import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Authenticated = ({ children }) => {
  const { user } = useSelector((state) => state.auth || {}); // Fallback to an empty object

  // Check if user is authenticated
  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  // If user already has a tenant selected, redirect to dashboard
  if (user?.userData?.selected_tenant) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated but no tenant selected - allow access to tenant selection
  return children;
};

export default Authenticated;

