import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Guest = ({ children }) => {
  const { user } = useSelector((state) => state.auth || {});
  
  if (user?.token) {
    if (user?.userData?.selected_tenant) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/select-tenant" replace />;
  }
  
  return children;
};
export default Guest;
