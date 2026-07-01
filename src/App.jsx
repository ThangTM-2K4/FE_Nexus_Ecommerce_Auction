import { Routes, Route } from "react-router-dom";

import Layout from "./layout";

import LoginPage from "./pages/auth/loginPage";
import RegisterPage from "./pages/auth/registerPage";
import AuthCallback from "./pages/auth/authCallback";
import ForgotPassword from "./pages/forgotPassword";
import VerifyOtp from "./pages/verifyOtp";
import ResetPassword from "./pages/resetPassword";

import HomePage from "./pages/homepage/homePage";

import ProfilePage from "./pages/user/profilePage";
import NotificationsPage from "./pages/user/notificationsPage";
import BuyerDashboard from "./pages/user/buyerDashboard";

import AdminDashboard from "./pages/admin/adminDashboard";
import StaffDashboard from "./pages/staff/staffDashboard";

import AuctionBrowsePage from "./pages/auction/auctionBrowsePage";
import AuctionDetailPage from "./pages/auction/auctionDetailPage";
import AuctionProfilePage from "./pages/auction/auctionProfilePage";
import AuctionSellerPage from "./pages/auction/auctionSellerPage";
import AuctionMyBidsPage from "./pages/auction/auctionMyBidsPage";
import AuctionCreatePage from "./pages/auction/auctionCreatePage";

import ProtectedRoute from "./config/ProtectedRoute";

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

      {/* ==========================
          Layout dùng chung
      ========================== */}

      <Route element={<Layout />}>

        {/* Home */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

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

        {/* Buyer */}
        <Route path="/buyer" element={<BuyerDashboard />} />

        {/* Auction */}
        <Route path="/auction/browse" element={<AuctionBrowsePage />} />
        <Route path="/auction/detail/:id" element={<AuctionDetailPage />} />
        <Route path="/auction/profile" element={<AuctionProfilePage />} />
        <Route path="/auction/my-bids" element={<AuctionMyBidsPage />} />
        <Route path="/auction/seller" element={<AuctionSellerPage />} />
        <Route path="/auction/create" element={<AuctionCreatePage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Staff */}
        <Route path="/staff" element={<StaffDashboard />} />

      </Route>

    </Routes>
  );
}

export default App;