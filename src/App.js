import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import Admin from "./pages/Admin";
import Redirect from "./pages/Redirect";
import ProductUpload from "./pages/ProductUpload";
import Marketplace from "./pages/Marketplace";
import ProductDetails from "./pages/ProductDetails";
import ApplyPromoter from "./pages/ApplyPromoter";
import Promote from "./pages/Promote";
import ChooseRole from "./pages/ChooseRole";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import Legal from "./pages/Legal";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PromoterRoute from "./components/PromoterRoute";
import Signup from "./pages/Signup";

function App() {
  const { currentUser, userProfile } = useContext(AuthContext);
  const hasRole = userProfile?.role && userProfile.role !== "user";

  return (
    <div style={styles.app}>
      <Navbar />

      <div style={styles.container}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/choose-role" element={<ProtectedRoute><ChooseRole /></ProtectedRoute>} />
          <Route path="/upload-product" element={<ProtectedRoute allowedRoles={["creator"]}><ProductUpload /></ProtectedRoute>} />
          <Route path="/apply-promoter" element={<ProtectedRoute allowedRoles={["promoter"]}><ApplyPromoter /></ProtectedRoute>} />
          <Route path="/promote" element={<PromoterRoute><Promote /></PromoterRoute>} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {currentUser && !hasRole ? <Navigate to="/choose-role" replace /> : <Dashboard />}
            </ProtectedRoute>
          } />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/go/:id" element={<Redirect />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  );
}

const styles = {
  app: { display: "flex", flexDirection: "column", height: "100vh", width: "100%", background: "radial-gradient(circle at top, #0f172a, #05070d)", color: "#fff", margin: 0, padding: 0, fontFamily: "Inter, sans-serif", overflow: "hidden" },
  container: { flex: 1, width: "100%", overflow: "auto" },
};

export default App;