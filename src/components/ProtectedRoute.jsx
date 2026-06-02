import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, userProfile } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  if (!userProfile) {
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>
        Loading user profile...
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to={userProfile.role === "admin" ? "/admin" : "/dashboard"} />;
  }

  return children;
}

export default ProtectedRoute;