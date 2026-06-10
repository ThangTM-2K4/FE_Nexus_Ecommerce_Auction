import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";

import HomePage from "./pages/homePage";

import AdminDashboard from "./pages/adminDashboard";
import StaffDashboard from "./pages/staffDashboard";
import SellerDashboard from "./pages/sellerDashboard";
import BuyerDashboard from "./pages/buyerDashboard";
import AuthCallback from "./pages/authCallback";

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
    </Routes>
  );
}

export default App;