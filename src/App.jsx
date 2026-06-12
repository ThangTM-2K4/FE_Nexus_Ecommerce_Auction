import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';

import HomePage from './pages/homePage';
import ProfilePage from './pages/profilePage';
import NotificationsPage from './pages/notificationsPage';
import BecomeSellerPage from './pages/becomeSellerPage';

import AdminDashboard from './pages/adminDashboard';
import StaffDashboard from './pages/staffDashboard';
import SellerDashboard from './pages/sellerDashboard';
import BuyerDashboard from './pages/buyerDashboard';
import AuthCallback from './pages/authCallback';

import ProtectedRoute from './config/ProtectedRoute';
import SellerRoute from './config/SellerRoute';

import AuctionBrowsePage from "./auction/pages/browsePage";
import AuctionDetailPage from "./auction/pages/detailPage";
import AuctionProfilePage from "./auction/pages/profilePage";
import AuctionSellerPage from "./auction/pages/sellerPage";
import AuctionMyBidsPage from "./auction/pages/myBidsPage";
import AuctionCreatePage from "./auction/pages/createPage";
import AuctionSellerRoute from "./auction/components/AuctionSellerRoute";
import AuctionBuyRoute from "./auction/components/AuctionBuyRoute";

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
