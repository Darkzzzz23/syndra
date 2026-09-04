// App.js
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/dashboard";
import Admin from "./pages/Admin";
import Marketplace from "./pages/Marketplace";
import ResellerProgram from "./pages/ResellerProgram";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Legal from "./pages/Legal";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div style={styles.app}>
      <Navbar />
      <div style={styles.container}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/reseller-program" element={<ResellerProgram />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/checkout/:type/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

const styles = {
  app: { display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0A0E17", fontFamily: "'Inter', sans-serif" },
  container: { flex: 1 },
};

export default App;