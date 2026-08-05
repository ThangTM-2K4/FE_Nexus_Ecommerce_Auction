import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sanitizeInternalRedirect } from "../utils/httpErrorRedirect";
import SellerWaitingPage from "../pages/seller/sellerWaitingPage";
import SellerRejectedPage from "../pages/seller/sellerRejectedPage";

export default function SellerRoute({ children }) {
  const { isAuthenticated, user, isSellerMode } = useAuth();
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

  // Chỉ cho phép truy cập Trang Quản lý Người bán khi tài khoản ĐANG BẬT Chế độ Người bán (SELLER mode)
  if (!isSellerMode || user?.currentMode !== "SELLER") {
    return <Navigate to="/auction" replace />;
  }

  if (sellerStatus === "APPROVED") {
    return children;
  }

  return <Navigate to="/profile/become-seller" replace />;
}
