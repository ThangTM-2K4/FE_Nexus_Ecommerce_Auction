import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SellerWaitingPage from "../pages/seller/sellerWaitingPage";
import SellerRejectedPage from "../pages/seller/sellerRejectedPage";

export default function SellerRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/401" replace />;
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

  // Đã duyệt: quyền seller do backend cấp qua role → vào thẳng dashboard,
  // không cần đang ở chế độ Người bán.
  if (sellerStatus === "APPROVED") {
    return children;
  }

  return <Navigate to="/profile/become-seller" replace />;
}
