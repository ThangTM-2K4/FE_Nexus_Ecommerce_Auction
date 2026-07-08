import { Routes, Route } from "react-router-dom";

import Layout from "./layout";

import LoginPage from "./pages/auth/loginPage";
import RegisterPage from "./pages/auth/registerPage";
import AuthCallback from "./pages/auth/authCallback";
import ForgotPassword from "./pages/auth/forgotPassword";
import VerifyOtp from "./pages/auth/forgotVerifyOtp";
import ResetPassword from "./pages/auth/resetPassword";
import RegisterVerifyOtpPage from "./pages/auth/registerVerityOtp";

import HomePage from "./pages/homepage/homePage";
import ProductDetailPage from "./pages/productDetailPage";

import ProfilePage from "./pages/user/profilePage";
import NotificationsPage from "./pages/user/notificationsPage";
import OrdersPage from "./pages/user/ordersPage";
import BankAccountRoutePage from "./pages/user/bankAccountPage";
import AddressRoutePage from "./pages/user/addressPage";
import NotificationSettingsRoutePage from "./pages/user/notificationSettingsPage";
import PersonalInfoRoutePage from "./pages/user/personalInfoPage";
import ChangePasswordRoutePage from "./pages/user/changePasswordPage";
import PrivacySettingsRoutePage from "./pages/user/privacySettingsPage";
import VouchersPage from "./pages/user/vouchersPage";
import CoinsPage from "./pages/user/coinsPage";

import BecomeSellerPage from "./pages/seller/becomeSellerPage";
import SellerDashboard from "./pages/seller/sellerDashboard";
import SellerHubRoutes from "./config/SellerHubRoutes";

import AdminDashboard from "./pages/admin/adminDashboard";

import StaffLayout from "./components/staff/staffLayout";
import StaffOverview from "./pages/staff/staffOverview";
import StaffSellerReview from "./pages/staff/staffSellerReview";
import StaffAuctionModeration from "./pages/staff/staffAuctionModeration";
import StaffDisputes from "./pages/staff/staffDisputes";
import {
  StaffOrders,
  StaffReports,
  StaffNotifications,
} from "./pages/staff/staffPlaceholder";

import AuctionBrowsePage from "./pages/auction/auctionBrowsePage";
import AuctionDetailPage from "./pages/auction/auctionDetailPage";
import AuctionProfilePage from "./pages/auction/auctionProfilePage";
import AuctionSellerPage from "./pages/auction/auctionSellerPage";
import AuctionMyBidsPage from "./pages/auction/auctionMyBidsPage";
import AuctionCreatePage from "./pages/auction/auctionCreatePage";

import ProtectedRoute from "./config/ProtectedRoute";
import SellerRoute from "./config/SellerRoute";

function App() {
  return (
    <Routes>

      {/* ==========================
          Auth Pages
      ========================== */}

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/register-verify-otp" element={<RegisterVerifyOtpPage />} />

      {/* ==========================
          Layout dùng chung
      ========================== */}

      <Route element={<Layout />}>

        {/* Home */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />

        {/* User */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/bank"
          element={
            <ProtectedRoute>
              <BankAccountRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/address"
          element={
            <ProtectedRoute>
              <AddressRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/notification-settings"
          element={
            <ProtectedRoute>
              <NotificationSettingsRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/personal-info"
          element={
            <ProtectedRoute>
              <PersonalInfoRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/privacy"
          element={
            <ProtectedRoute>
              <PrivacySettingsRoutePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/vouchers"
          element={
            <ProtectedRoute>
              <VouchersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/coins"
          element={
            <ProtectedRoute>
              <CoinsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/become-seller"
          element={
            <ProtectedRoute>
              <BecomeSellerPage />
            </ProtectedRoute>
          }
        />

        {/* Buyer
        <Route path="/buyer" element={<BuyerDashboard />} /> */}

        {/* Auction */}
        <Route path="/auction/browse" element={<AuctionBrowsePage />} />
        <Route path="/auction/detail/:id" element={<AuctionDetailPage />} />
        <Route path="/auction/profile" element={<AuctionProfilePage />} />
        <Route path="/auction/my-bids" element={<AuctionMyBidsPage />} />
        <Route path="/auction/seller" element={<AuctionSellerPage />} />
        <Route path="/auction/create" element={<AuctionCreatePage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

      </Route>

   {/* seller - dã ket noi api }
      <Route
        path="/seller"
        element={
          <SellerRoute>
            <SellerDashboard />
          </SellerRoute>
        }
      />
      <Route
        path="/seller-hub/*"
        element={
          <SellerRoute>
            <SellerHubRoutes />
          </SellerRoute>
        }
      />
    */}

    {/*chạy thử seller hub */}
    <Route
      path="/seller"
      element={<SellerDashboard />}
    />

    <Route
      path="/seller-hub/*"
      element={<SellerHubRoutes />}
    />


      {/* Staff Hub — kết nối API  
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffOverview />} />
        <Route path="overview" element={<StaffOverview />} />
        <Route path="seller-review" element={<StaffSellerReview />} />
        <Route path="auctions" element={<StaffAuctionModeration />} />
        <Route path="disputes" element={<StaffDisputes />} />
        <Route path="orders" element={<StaffOrders />} />
        <Route path="reports" element={<StaffReports />} />
        <Route path="notifications" element={<StaffNotifications />} />
      </Route>
      */}

{/*chạy thử staff hub */}
    <Route path="/staff" element={<StaffLayout />}>
      <Route index element={<StaffOverview />} />
      <Route path="overview" element={<StaffOverview />} />
      <Route path="seller-review" element={<StaffSellerReview />} />
      <Route path="auctions" element={<StaffAuctionModeration />} />
      <Route path="disputes" element={<StaffDisputes />} />
      <Route path="orders" element={<StaffOrders />} />
      <Route path="reports" element={<StaffReports />} />
      <Route path="notifications" element={<StaffNotifications />} />
    </Route>

    </Routes>
  );
}

export default App;