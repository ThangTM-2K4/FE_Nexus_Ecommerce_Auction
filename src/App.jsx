import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/auth/loginPage';
import RegisterPage from './pages/auth/registerPage';

import HomePage from './pages/homepage/homePage';
import ProfilePage from './pages/user/profilePage';
import NotificationsPage from './pages/user/notificationsPage';
import BecomeSellerPage from './pages/seller/becomeSellerPage';

import AdminDashboard from './pages/admin/adminDashboard';
import StaffDashboard from './pages/staff/staffDashboard';
import SellerDashboard from './pages/seller/sellerDashboard';
import BuyerDashboard from './pages/user/buyerDashboard';
import SellerHubRoutes from './config/SellerHubRoutes';
import AuthCallback from './pages/auth/authCallback';

import ProtectedRoute from './config/ProtectedRoute';
import SellerRoute from './config/SellerRoute';

import AuctionBrowsePage from "./pages/auction/auctionBrowsePage";
import AuctionDetailPage from "./pages/auction/auctionDetailPage";
import AuctionProfilePage from "./pages/auction/auctionProfilePage";
import AuctionSellerPage from "./pages/auction/auctionSellerPage";
import AuctionMyBidsPage from "./pages/auction/auctionMyBidsPage";
import AuctionCreatePage from "./pages/auction/auctionCreatePage";
import AuctionSellerRoute from "./config/AuctionSellerRoute";
import AuctionBuyRoute from "./config/AuctionBuyRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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
        path="/profile/become-seller"
        element={
          <ProtectedRoute>
            <BecomeSellerPage />
          </ProtectedRoute>
        }
      />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/staff" element={<StaffDashboard />} />
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
      <Route path="/buyer" element={<BuyerDashboard />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/auction/browse"
        element={
          <AuctionBuyRoute>
            <AuctionBrowsePage />
          </AuctionBuyRoute>
        }
      />
      <Route
        path="/auction/detail/:id"
        element={
          <AuctionBuyRoute>
            <AuctionDetailPage />
          </AuctionBuyRoute>
        }
      />
      <Route
        path="/auction/profile"
        element={
          <AuctionBuyRoute>
            <AuctionProfilePage />
          </AuctionBuyRoute>
        }
      />
      <Route
        path="/auction/seller"
        element={
          <AuctionSellerRoute>
            <AuctionSellerPage />
          </AuctionSellerRoute>
        }
      />
      <Route
        path="/auction/create"
        element={
          <AuctionSellerRoute>
            <AuctionCreatePage />
          </AuctionSellerRoute>
        }
      />
      <Route
        path="/auction/my-bids"
        element={
          <AuctionBuyRoute>
            <AuctionMyBidsPage />
          </AuctionBuyRoute>
        }
      />
    </Routes>
  );
}

export default App;
