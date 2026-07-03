import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SellerWaitingPage from "../pages/seller/sellerWaitingPage";
import SellerRejectedPage from "../pages/seller/sellerRejectedPage";

export default function SellerRoute({ children }) {
  const { isAuthenticated, user, isSellerMode } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const { sellerStatus } = user;

  if (!sellerStatus || sellerStatus === null) {
    return <Navigate to="/profile/become-seller" replace />;
  }

  if (sellerStatus === "PENDING") {
    return <SellerWaitingPage />;
  }

  if (sellerStatus === "REJECTED") {
    return <SellerRejectedPage />;
  }

  if (sellerStatus === "APPROVED" && !isSellerMode) {
    return <Navigate to="/" replace />;
  }

  if (sellerStatus === "APPROVED") {
    return children;
  }

  return <Navigate to="/profile/become-seller" replace />;
}
