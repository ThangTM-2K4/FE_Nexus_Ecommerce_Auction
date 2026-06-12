import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuctionBuyRoute({ children }) {
  const { isAuthenticated, isApprovedSeller, isSellerMode } = useAuth();

  if (isAuthenticated && isApprovedSeller && isSellerMode) {
    return <Navigate to="/auction/seller" replace />;
  }

  return children;
}
