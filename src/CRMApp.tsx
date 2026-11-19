import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import CrmDashboard from "./pages/CrmDashboard";
import CrmLandingPage from "./pages/CrmLandingPage";
import CrmLoginPage from "./pages/CrmLoginPage";
import CrmResetPasswordPage from "./pages/CrmResetPasswordPage";
import CrmSettingsPage from "./pages/CrmSettingsPage";
import CrmSignupPage from "./pages/CrmSignupPage";

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-state">Loading your workspace…</div>;
  return user ? <Navigate to="/app" replace /> : <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-state">Loading your workspace…</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function CRMApp() {
  return (
    <Routes>
      <Route path="/" element={<CrmLandingPage />} />
      <Route path="/login" element={<AuthRoute><CrmLoginPage /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><CrmSignupPage /></AuthRoute>} />
      <Route path="/reset-password" element={<AuthRoute><CrmResetPasswordPage /></AuthRoute>} />
      <Route path="/app" element={<ProtectedRoute><CrmDashboard /></ProtectedRoute>} />
      <Route path="/app/settings" element={<ProtectedRoute><CrmSettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}