import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { currentUser, userProfile } = useContext(AuthContext);
  const role = userProfile?.role;

  console.log("AdminRoute - role:", role);

  if (!currentUser) return <Navigate to="/login" replace />;

  if (role === "owner" || role === "admin" || role === "moderator") {
    return children;
  }

  return <Navigate to="/dashboard" replace />;
}

export default AdminRoute;