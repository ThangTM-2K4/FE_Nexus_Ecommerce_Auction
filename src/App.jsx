import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";

import HomePage from "./pages/homePage";

import AdminDashboard from "./pages/adminDashboard";
import StaffDashboard from "./pages/staffDashboard";
import SellerDashboard from "./pages/sellerDashboard";
import BuyerDashboard from "./pages/buyerDashboard";
import AuthCallback from "./pages/authCallback";

import AuctionBrowsePage from "./auction/pages/browsePage";
import AuctionDetailPage from "./auction/pages/detailPage";
import AuctionProfilePage from "./auction/pages/profilePage";
import AuctionSellerPage from "./auction/pages/sellerPage";
import AuctionMyBidsPage from "./auction/pages/myBidsPage";
import AuctionCreatePage from "./auction/pages/createPage";

function App() {
  return (
    <Routes>
      <Route path="/" 
        element={<LoginPage />} />
      <Route
        path="/register"
        element={<RegisterPage />}
      />
      <Route
        path="/home"
        element={<HomePage />}
      />
      <Route
        path="/admin"
        element={<AdminDashboard />}
      />
      <Route
        path="/staff"
        element={<StaffDashboard />}
      />
      <Route
        path="/seller"
        element={<SellerDashboard />}
      />
      <Route
        path="/buyer"
        element={<BuyerDashboard />}
      />
      <Route
        path="/auth/callback"
        element={<AuthCallback />}
      />
      <Route path="/auction/browse" element={<AuctionBrowsePage />} />
      <Route path="/auction/detail/:id" element={<AuctionDetailPage />} />
      <Route path="/auction/profile" element={<AuctionProfilePage />} />
      <Route path="/auction/seller" element={<AuctionSellerPage />} />
      <Route path="/auction/create" element={<AuctionCreatePage />} />
      <Route path="/auction/my-bids" element={<AuctionMyBidsPage />} />
    </Routes>
  );
}

export default App;