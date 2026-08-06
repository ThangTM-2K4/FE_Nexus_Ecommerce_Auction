import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sanitizeInternalRedirect } from "../utils/httpErrorRedirect";
import SellerWaitingPage from "../pages/seller/sellerWaitingPage";
import SellerRejectedPage from "../pages/seller/sellerRejectedPage";

export default function SellerRoute({ children }) {
  const { isAuthenticated, user, isApprovedSeller } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const returnPath = sanitizeInternalRedirect(location.pathname + location.search) ?? '/';
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(returnPath)}`}
        replace
      />
    );
  }

  const sellerStatus = user?.sellerStatus;

  // Cho phép truy cập Trang Quản lý Người bán nếu tài khoản là Người bán đã được phê duyệt
  if (isApprovedSeller || sellerStatus === "APPROVED" || user?.isSeller || user?.role === "SELLER") {
    return children;
  }

  if (sellerStatus === "PENDING") {
    return <SellerWaitingPage />;
  }

  if (sellerStatus === "REJECTED") {
    return <SellerRejectedPage />;
  }

  return <Navigate to="/profile/become-seller" replace />;
}
