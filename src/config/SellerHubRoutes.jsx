import { Navigate, Route, Routes } from "react-router-dom";
import SellerLayout from "../components/sellerdashboard/sellerLayout";
import OverviewPage from "../pages/seller/sellerOverviewPage";
import ShopProfilePage from "../pages/seller/sellerShopProfilePage";
import ShopRatingPage from "../pages/seller/sellerShopRatingPage";
import ShopDecorationPage from "../pages/seller/sellerShopDecorationPage";
import ShopCategoriesPage from "../pages/seller/sellerShopCategoriesPage";
import MediaLibraryPage from "../pages/seller/sellerMediaLibraryPage";
import MyReportsPage from "../pages/seller/sellerMyReportsPage";
import RevenuePage from "../pages/seller/sellerRevenuePage";
import ProductsPage from "../pages/seller/sellerProductsPage";
import CreateProductPage from "../pages/seller/sellerCreateProductPage";
import OrdersPage from "../pages/seller/sellerOrdersPage";
import CustomersPage from "../pages/seller/sellerCustomersPage";
import PerformancePage from "../pages/seller/sellerPerformancePage";
import ReviewsPage from "../pages/seller/sellerReviewsPage";
import NotificationsPage from "../pages/seller/sellerNotificationsPage";
import WalletPage from "../pages/seller/sellerWalletPage";
import GeneralSettingsPage from "../pages/seller/sellerGeneralSettingsPage";
import ShippingSettingsPage from "../pages/seller/sellerShippingSettingsPage";
import ShippingManagementPage from "../pages/seller/sellerShippingManagementPage";
import BatchShippingPage from "../pages/seller/sellerBatchShippingPage";
import HelpPage from "../pages/seller/sellerHelpPage";

export default function SellerHubRoutes() {
  return (
    <Routes>
      <Route element={<SellerLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="shop-profile" element={<ShopProfilePage />} />
        <Route path="shop-rating" element={<ShopRatingPage />} />
        <Route path="shop-decoration" element={<ShopDecorationPage />} />
        <Route path="shop-categories" element={<ShopCategoriesPage />} />
        <Route path="media-library" element={<MediaLibraryPage />} />
        <Route path="my-reports" element={<MyReportsPage />} />
        <Route path="revenue" element={<RevenuePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders-cancelled" element={<OrdersPage />} />
        <Route path="orders-returns" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="general-settings" element={<GeneralSettingsPage />} />
        <Route path="shipping" element={<ShippingManagementPage />} />
        <Route path="shipping-batch" element={<BatchShippingPage />} />
        <Route path="shipping-settings" element={<ShippingSettingsPage />} />
        <Route path="help" element={<HelpPage />} />
      </Route>
    </Routes>
  );
}
