import { Navigate, Route, Routes } from "react-router-dom";
import SellerLayout from "../components/sellerdashboard/sellerLayout";
import OverviewPage from "../pages/seller/sellerOverviewPage";
import RevenuePage from "../pages/seller/sellerRevenuePage";
import ProductsPage from "../pages/seller/sellerProductsPage";
import OrdersPage from "../pages/seller/sellerOrdersPage";
import CustomersPage from "../pages/seller/sellerCustomersPage";
import PerformancePage from "../pages/seller/sellerPerformancePage";
import ReviewsPage from "../pages/seller/sellerReviewsPage";
import NotificationsPage from "../pages/seller/sellerNotificationsPage";
import WalletPage from "../pages/seller/sellerWalletPage";

export default function SellerHubRoutes() {
  return (
    <Routes>
      <Route element={<SellerLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="revenue" element={<RevenuePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="wallet" element={<WalletPage />} />
      </Route>
    </Routes>
  );
}
