import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../components/admin/adminLayout";
import AdminDashboard from "../pages/admin/adminDashboard";
import {
  AdminUsers,
  AdminSellerVerification,
  AdminProducts,
  AdminAuctionProducts,
  AdminCategories,
  AdminBrands,
  AdminOrders,
  AdminAuctionOrders,
  AdminBids,
  AdminPayments,
  AdminWallets,
  AdminCommissions,
  AdminCoupons,
  AdminShipping,
  AdminReviews,
  AdminReports,
  AdminNotifications,
  AdminBanners,
  AdminContent,
  AdminAnalytics,
  AdminSettings,
  AdminRoles,
  AdminAuditLogs,
  AdminFraud,
  AdminWithdrawals,
  AdminSupportTickets,
  AdminInventory,
} from "../pages/admin/modules";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="seller-verification" element={<AdminSellerVerification />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="auction-products" element={<AdminAuctionProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="auction-orders" element={<AdminAuctionOrders />} />
        <Route path="bids" element={<AdminBids />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="wallets" element={<AdminWallets />} />
        <Route path="commissions" element={<AdminCommissions />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="shipping" element={<AdminShipping />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="fraud" element={<AdminFraud />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
        <Route path="support-tickets" element={<AdminSupportTickets />} />
        <Route path="inventory" element={<AdminInventory />} />
      </Route>
    </Routes>
  );
}
