import { Routes, Route, Navigate } from "react-router-dom";

// Authentication
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import ForgotPassword from "./pages/forgotPassword";
import VerifyOtp from "./pages/verifyOtp";
import ResetPassword from "./pages/resetPassword";
import AuthCallback from "./pages/authCallback";

// Home
import HomePage from "./pages/homePage";

// User
import ProfilePage from "./pages/profilePage";
import NotificationsPage from "./pages/notificationsPage";
import BecomeSellerPage from "./pages/becomeSellerPage";

// Dashboard
import AdminDashboard from "./pages/adminDashboard";
import StaffDashboard from "./pages/staffDashboard";
import BuyerDashboard from "./pages/buyerDashboard";

// Seller
import SellerDashboard from "./pages/seller/sellerDashboard";
import SellerAuctionList from "./pages/seller/sellerAuctionList";
import SellerCreateAuction from "./pages/seller/sellerCreateAuction";
import SellerAuctionDetail from "./pages/seller/sellerAuctionDetail";
import SellerOrders from "./pages/seller/sellerOrders";
import SellerProfile from "./pages/seller/sellerProfile";
import SellerRevenue from "./pages/seller/sellerRevenue";
import SellerWallet from "./pages/seller/sellerWallet";
import SellerNotification from "./pages/seller/sellerNotification";
import SellerSettings from "./pages/seller/sellerSettings";

// Auction
import AuctionBrowsePage from "./auction/pages/browsePage";
import AuctionDetailPage from "./auction/pages/detailPage";
import AuctionProfilePage from "./auction/pages/profilePage";
import AuctionSellerPage from "./auction/pages/sellerPage";
import AuctionMyBidsPage from "./auction/pages/myBidsPage";
import AuctionCreatePage from "./auction/pages/createPage";

// Route Guards
import ProtectedRoute from "./config/ProtectedRoute";
import SellerRoute from "./config/SellerRoute";

function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* User */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/profile/become-seller" element={<ProtectedRoute><BecomeSellerPage /></ProtectedRoute>} />

      {/* Dashboard */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/staff" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
      <Route path="/buyer" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />

      {/* Seller */}
      <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
      <Route path="/seller/dashboard" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
      <Route path="/seller/auctions" element={<SellerRoute><SellerAuctionList /></SellerRoute>} />
      <Route path="/seller/create-auction" element={<SellerRoute><SellerCreateAuction /></SellerRoute>} />
      <Route path="/seller/auction/:id" element={<SellerRoute><SellerAuctionDetail /></SellerRoute>} />
      <Route path="/seller/orders" element={<SellerRoute><SellerOrders /></SellerRoute>} />
      <Route path="/seller/profile" element={<SellerRoute><SellerProfile /></SellerRoute>} />
      <Route path="/seller/revenue" element={<SellerRoute><SellerRevenue /></SellerRoute>} />
      <Route path="/seller/wallet" element={<SellerRoute><SellerWallet /></SellerRoute>} />
      <Route path="/seller/notifications" element={<SellerRoute><SellerNotification /></SellerRoute>} />
      <Route path="/seller/settings" element={<SellerRoute><SellerSettings /></SellerRoute>} />

      {/* Auction */}
      <Route path="/auction/browse" element={<AuctionBrowsePage />} />
      <Route path="/auction/detail/:id" element={<AuctionDetailPage />} />
      <Route path="/auction/profile" element={<AuctionProfilePage />} />
      <Route path="/auction/seller" element={<AuctionSellerPage />} />
      <Route path="/auction/create" element={<AuctionCreatePage />} />
      <Route path="/auction/my-bids" element={<AuctionMyBidsPage />} />

      {/* 404 */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />

    </Routes>
  );
}

export default App;