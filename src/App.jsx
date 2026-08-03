import { Routes, Route } from "react-router-dom";

import Layout from "./layout";

import LoginPage from "./pages/auth/loginPage";
import RegisterPage from "./pages/auth/registerPage";
import AuthCallback from "./pages/auth/authCallback";
import ForgotPassword from "./pages/auth/forgotPassword";
import VerifyOtp from "./pages/auth/forgotVerifyOtp";
import ResetPassword from "./pages/auth/resetPassword";
import RegisterVerifyOtpPage from "./pages/auth/registerVerifyOtp";
import TermsPage from "./pages/auth/termsPage";

import HomePage from "./pages/homepage/homePage";
import ProductDetailPage from "./pages/productDetailPage";
import ShopProfilePage from "./pages/shop/shopProfilePage";
import CartPage from "./pages/cartPage";
import CheckoutPage from "./pages/checkoutPage";

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

import AdminRoutes from "./config/AdminRoutes";

import StaffLayout from "./components/staff/staffLayout";
import StaffOverview from "./pages/staff/staffOverview";
import StaffProfile from "./pages/staff/staffProfile";
import StaffSellerReview from "./pages/staff/staffSellerReview";
import StaffProductReview from "./pages/staff/staffProductReview";
import StaffAuctionModeration from "./pages/staff/staffAuctionModeration";
import StaffDisputes from "./pages/staff/staffDisputes";
import StaffReports from "./pages/staff/staffReports";
import StaffSellers from "./pages/staff/staffSellers";
import StaffUsers from "./pages/staff/staffUsers";
import StaffRoles from "./pages/staff/staffRoles";
import StaffProducts from "./pages/staff/staffProducts";
import StaffCategories from "./pages/staff/staffCategories";
import StaffOrders from "./pages/staff/staffOrders";
import StaffAuctionsLookup from "./pages/staff/staffAuctionsLookup";
import StaffShipping from "./pages/staff/staffShipping";
import StaffEventLog from "./pages/staff/staffEventLog";
import StaffActivity from "./pages/staff/staffActivity";
import StaffNotifications from "./pages/staff/staffNotifications";

import AuctionLayout from "./components/auction/auctionLayout";
import AuctionBrowsePage from "./pages/auction/auctionBrowsePage";
import AuctionDetailPage from "./pages/auction/auctionDetailPage";
import AuctionCreatePage from "./pages/auction/auctionCreatePage";
import AuctionMyBidsPage from "./pages/auction/auctionMyBidsPage";
import AuctionProfilePage from "./pages/auction/auctionProfilePage";
import AuctionSellerPage from "./pages/auction/auctionSellerPage";
import AuctionCategoriesPage from "./pages/auction/auctionCategoriesPage";
import AuctionLocationsPage from "./pages/auction/auctionLocationsPage";
import AuctionHowItWorksPage from "./pages/auction/auctionHowItWorksPage";
import AuctionWatchlistPage from "./pages/auction/auctionWatchlistPage";

import ProtectedRoute from "./config/ProtectedRoute";
import SellerRoute from "./config/SellerRoute";

import Error401Page from "./pages/errors/401";
import Error403Page from "./pages/errors/403";
import Error404Page from "./pages/errors/404";
import Error500Page from "./pages/errors/500";
import Error503Page from "./pages/errors/503";
import AuctionIntroTestPage from "./pages/auctionIntroTest";
import SiteChatWidget from "./chat";

function App() {
  return (
    <>
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
  <Route path="/terms" element={<TermsPage />} />
  <Route path="/test-intro" element={<AuctionIntroTestPage />} />

  {/* ==========================
      Shared layout
  ========================== */}

  <Route element={<Layout />}>

    {/* Home */}
    <Route path="/" element={<HomePage />} />
    <Route path="/home" element={<HomePage />} />
    <Route path="/product/:id" element={<ProductDetailPage />} />
    <Route path="/shop/:shopId" element={<ShopProfilePage />} />

    <Route path="/cart" element={<CartPage />} />

    <Route
      path="/checkout"
      element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      }
    />

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
      path="/profile/become-seller"
      element={
        <ProtectedRoute>
          <BecomeSellerPage />
        </ProtectedRoute>
      }
    />

      </Route>

      {/* Auction zone — separate header/footer layout */}
      <Route path="/auction" element={<AuctionLayout />}>
        <Route index element={<AuctionBrowsePage />} />
        <Route path="browse" element={<AuctionBrowsePage />} />
        <Route path="detail/:id" element={<AuctionDetailPage />} />
        <Route
          path="create"
          element={
            <ProtectedRoute>
              <AuctionCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-bids"
          element={
            <ProtectedRoute>
              <AuctionMyBidsPage />
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<AuctionProfilePage />} />
        <Route path="seller" element={<AuctionSellerPage />} />
        <Route path="categories" element={<AuctionCategoriesPage />} />
        <Route path="locations" element={<AuctionLocationsPage />} />
        <Route path="how-it-works" element={<AuctionHowItWorksPage />} />
        <Route path="watchlist" element={<AuctionWatchlistPage />} />
      </Route>

  {/* Seller */}
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

  {/* Admin */}
  <Route
    path="/admin/*"
    element={
      <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
        <AdminRoutes />
      </ProtectedRoute>
    }
  />

  {/* Staff */}
  <Route
    path="/staff"
    element={
      <ProtectedRoute allowedRoles={["STAFF", "SUPPORT_STAFF", "ADMIN"]}>
        <StaffLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<StaffOverview />} />
    <Route path="overview" element={<StaffOverview />} />
    <Route path="profile" element={<StaffProfile />} />

    <Route path="seller-review" element={<StaffSellerReview />} />
    <Route path="product-review" element={<StaffProductReview />} />
    <Route path="auctions" element={<StaffAuctionModeration />} />
    <Route path="disputes" element={<StaffDisputes />} />
    <Route path="reports" element={<StaffReports />} />

    <Route path="sellers" element={<StaffSellers />} />
    <Route path="users" element={<StaffUsers />} />
    <Route path="roles" element={<StaffRoles />} />
    <Route path="products" element={<StaffProducts />} />
    <Route path="categories" element={<StaffCategories />} />
    <Route path="orders" element={<StaffOrders />} />
    <Route path="auction-lookup" element={<StaffAuctionsLookup />} />
    <Route path="shipping" element={<StaffShipping />} />
    <Route path="event-log" element={<StaffEventLog />} />
    <Route path="activity" element={<StaffActivity />} />
    <Route path="notifications" element={<StaffNotifications />} />
  </Route>

  {/* Error pages */}
  <Route path="/401" element={<Error401Page />} />
  <Route path="/403" element={<Error403Page />} />
  <Route path="/404" element={<Error404Page />} />
  <Route path="/500" element={<Error500Page />} />
  <Route path="/503" element={<Error503Page />} />
  <Route path="*" element={<Error404Page />} />
</Routes>
    <SiteChatWidget />
    </>
  );
}

export default App;