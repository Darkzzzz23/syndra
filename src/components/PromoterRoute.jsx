import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getPromoterByUid } from "../services/promotionService";

function PromoterRoute({ children }) {
  const { currentUser } = useContext(AuthContext);
  const [promoter, setPromoter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPromoter = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const profile = await getPromoterByUid(currentUser.uid);
        setPromoter(profile);
      } catch {
        setPromoter(null);
      } finally {
        setLoading(false);
      }
    };
    checkPromoter();
  }, [currentUser]);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (loading) return <div style={{ padding: "40px", color: "#fff" }}>Checking promoter status...</div>;
  if (!promoter || promoter.status !== "approved") return <Navigate to="/apply-promoter" replace />;

  return children;
}

export default PromoterRoute;