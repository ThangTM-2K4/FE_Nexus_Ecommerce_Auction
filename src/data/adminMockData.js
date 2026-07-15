export const ADMIN_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  FINANCE: "FINANCE",
  SUPPORT: "SUPPORT",
};

export const ADMIN_ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Quản trị viên",
  MODERATOR: "Kiểm duyệt",
  FINANCE: "Tài chính",
  SUPPORT: "Hỗ trợ khách hàng",
};

const ALL_ROLES = Object.values(ADMIN_ROLES);

export const MODULE_PERMISSIONS = {
  dashboard: ALL_ROLES,
  users: ["SUPER_ADMIN", "ADMIN", "MODERATOR", "SUPPORT"],
  "seller-verification": ["SUPER_ADMIN", "ADMIN"],
  products: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  "auction-products": ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  categories: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  brands: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  orders: ["SUPER_ADMIN", "ADMIN", "MODERATOR", "FINANCE", "SUPPORT"],
  "auction-orders": ["SUPER_ADMIN", "ADMIN", "MODERATOR", "FINANCE", "SUPPORT"],
  bids: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  payments: ["SUPER_ADMIN", "ADMIN", "FINANCE"],
  wallets: ["SUPER_ADMIN", "ADMIN", "FINANCE"],
  commissions: ["SUPER_ADMIN", "ADMIN", "FINANCE"],
  coupons: ["SUPER_ADMIN", "ADMIN"],
  shipping: ["SUPER_ADMIN", "ADMIN"],
  reviews: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  reports: ["SUPER_ADMIN", "ADMIN", "MODERATOR", "SUPPORT"],
  notifications: ["SUPER_ADMIN", "ADMIN"],
  banners: ["SUPER_ADMIN", "ADMIN"],
  content: ["SUPER_ADMIN", "ADMIN"],
  analytics: ["SUPER_ADMIN", "ADMIN", "FINANCE"],
  settings: ["SUPER_ADMIN"],
  roles: ["SUPER_ADMIN"],
  "audit-logs": ["SUPER_ADMIN", "ADMIN", "FINANCE"],
  fraud: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  withdrawals: ["SUPER_ADMIN", "ADMIN", "FINANCE"],
  "support-tickets": ["SUPER_ADMIN", "ADMIN", "SUPPORT"],
  inventory: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
};

export const adminMenuSections = [
  {
    title: "Tổng quan",
    items: [
      { id: "dashboard", label: "Tổng quan", icon: "grid", path: "/admin/dashboard" },
    ],
  },
  {
    title: "Người dùng",
    items: [
      { id: "users", label: "Quản lý người dùng", icon: "users", path: "/admin/users" },
      { id: "seller-verification", label: "Xác minh Seller", icon: "idCard", path: "/admin/seller-verification" },
    ],
  },
  {
    title: "Sản phẩm",
    items: [
      { id: "products", label: "Quản lý sản phẩm", icon: "box", path: "/admin/products" },
      { id: "categories", label: "Danh mục", icon: "folder", path: "/admin/categories" },
      { id: "brands", label: "Thương hiệu", icon: "tag", path: "/admin/brands" },
      { id: "inventory", label: "Tồn kho", icon: "warehouse", path: "/admin/inventory" },
    ],
  },
  {
    title: "Đấu giá",
    items: [
      { id: "auction-products", label: "Phiên đấu giá", icon: "gavel", path: "/admin/auction-products" },
      { id: "auction-orders", label: "Đơn đấu giá", icon: "hammer", path: "/admin/auction-orders" },
      { id: "bids", label: "Quản lý Bid", icon: "handPointer", path: "/admin/bids" },
    ],
  },
  {
    title: "Giao dịch",
    items: [
      { id: "orders", label: "Đơn hàng", icon: "cart", path: "/admin/orders" },
      { id: "payments", label: "Thanh toán", icon: "creditCard", path: "/admin/payments" },
      { id: "wallets", label: "Ví điện tử", icon: "wallet", path: "/admin/wallets" },
      { id: "withdrawals", label: "Rút tiền", icon: "moneyBill", path: "/admin/withdrawals" },
    ],
  },
  {
    title: "Vận hành",
    items: [
      { id: "commissions", label: "Hoa hồng & Phí", icon: "percent", path: "/admin/commissions" },
      { id: "coupons", label: "Coupon", icon: "ticket", path: "/admin/coupons" },
      { id: "shipping", label: "Vận chuyển", icon: "truck", path: "/admin/shipping" },
      { id: "reviews", label: "Đánh giá", icon: "star", path: "/admin/reviews" },
      { id: "reports", label: "Báo cáo & Khiếu nại", icon: "flag", path: "/admin/reports" },
      { id: "fraud", label: "Phát hiện gian lận", icon: "shield", path: "/admin/fraud" },
      { id: "support-tickets", label: "Ticket hỗ trợ", icon: "headset", path: "/admin/support-tickets" },
    ],
  },
  {
    title: "Nội dung & Marketing",
    items: [
      { id: "notifications", label: "Thông báo", icon: "bell", path: "/admin/notifications" },
      { id: "banners", label: "Banner", icon: "image", path: "/admin/banners" },
      { id: "content", label: "Nội dung", icon: "fileAlt", path: "/admin/content" },
    ],
  },
  {
    title: "Phân tích & Hệ thống",
    items: [
      { id: "analytics", label: "Phân tích", icon: "chartLine", path: "/admin/analytics" },
      { id: "settings", label: "Cài đặt hệ thống", icon: "cog", path: "/admin/settings" },
      { id: "roles", label: "Vai trò & Quyền", icon: "userShield", path: "/admin/roles" },
      { id: "audit-logs", label: "Nhật ký hệ thống", icon: "history", path: "/admin/audit-logs" },
    ],
  },
];

export const dashboardStats = [
  { id: "total-users", label: "Tổng số người dùng", value: "24.582", hint: "+128 tuần này" },
  { id: "total-sellers", label: "Tổng số Seller", value: "1.847", hint: "Đang hoạt động: 1.692" },
  { id: "pending-sellers", label: "Seller đang chờ duyệt", value: "34", hint: "Cần xử lý", warn: true },
  { id: "total-products", label: "Tổng số sản phẩm", value: "18.420", hint: "Toàn nền tảng" },
  { id: "active-products", label: "Sản phẩm đang bán", value: "14.256", hint: "77% tổng SP" },
  { id: "auction-products", label: "Sản phẩm đấu giá", value: "2.184", hint: "186 phiên đang live" },
  { id: "total-orders", label: "Tổng đơn hàng", value: "96.340", hint: "+1.240 tháng này" },
  { id: "total-transactions", label: "Tổng giao dịch", value: "112.890", hint: "Bao gồm đấu giá" },
  { id: "revenue", label: "Doanh thu", value: "48.2 tỷ", hint: "Tháng 7/2026", highlight: true },
  { id: "commission", label: "Hoa hồng hệ thống", value: "2.41 tỷ", hint: "5% trung bình", highlight: true },
  { id: "live-auctions", label: "Phiên đấu giá đang diễn ra", value: "186", hint: "Real-time" },
  { id: "ending-auctions", label: "Phiên sắp kết thúc", value: "24", hint: "< 2 giờ", warn: true },
  { id: "completed-auctions", label: "Phiên đã hoàn thành", value: "8.420", hint: "Tháng này: 312" },
  { id: "complaints", label: "Đơn khiếu nại", value: "47", hint: "12 đang mở", warn: true },
  { id: "violations", label: "Báo cáo vi phạm", value: "23", hint: "5 mức cao", warn: true },
];

export const dashboardCharts = {
  revenueDaily: {
    type: "line",
    detailed: true,
    title: "Doanh thu theo ngày",
    subtitle: "Chi tiết 7 ngày gần nhất — hover điểm để xem đơn hàng",
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    dates: ["30/06", "01/07", "02/07", "03/07", "04/07", "05/07", "06/07"],
    values: [62, 78, 71, 89, 95, 112, 88],
    orders: [892, 1045, 978, 1210, 1156, 1380, 1089],
    changePct: 12.4,
    unit: "triệu VNĐ",
    color: "#B35A8A",
    wide: true,
  },
  revenueMonthly: {
    type: "bar",
    title: "Doanh thu theo tháng",
    subtitle: "6 tháng đầu năm 2026",
    labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
    values: [38, 42, 45, 41, 46, 48],
    unit: "tỷ VNĐ",
    color: "#523F77",
  },
  productMix: {
    type: "donut",
    title: "Cơ cấu sản phẩm",
    subtitle: "Phân bổ trên nền tảng",
    segments: [
      { label: "Đang bán", value: 77, color: "#1fa968" },
      { label: "Đấu giá", value: 12, color: "#B35A8A" },
      { label: "Chờ duyệt", value: 8, color: "#d4920a" },
      { label: "Ẩn / Khác", value: 3, color: "#B6A5CE" },
    ],
  },
  orders: {
    type: "stacked",
    title: "Đơn hàng theo loại",
    subtitle: "Mua thường vs Đấu giá",
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    unit: "đơn",
    series: [
      { name: "Mua thường", color: "#7880AE", values: [320, 380, 350, 450, 420, 510, 400] },
      { name: "Đấu giá", color: "#B35A8A", values: [100, 130, 130, 170, 170, 200, 140] },
    ],
  },
  topCategories: {
    type: "horizontal",
    title: "Doanh thu theo danh mục",
    subtitle: "Top 5 danh mục",
    unit: "tỷ VNĐ",
    items: [
      { label: "Thời trang", value: 12.4, display: "12.4 tỷ" },
      { label: "Điện thoại", value: 8.7, display: "8.7 tỷ" },
      { label: "Đồng hồ", value: 6.2, display: "6.2 tỷ" },
      { label: "Laptop", value: 4.1, display: "4.1 tỷ" },
      { label: "Phụ kiện", value: 2.8, display: "2.8 tỷ" },
    ],
  },
  registrations: {
    type: "sparkline",
    title: "Người đăng ký mới",
    subtitle: "Tổng tuần này",
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    values: [85, 102, 94, 128, 115, 142, 98],
    unit: "user",
    color: "#7880AE",
  },
  auctionStatus: {
    type: "donut",
    title: "Trạng thái đấu giá",
    subtitle: "Phiên đấu giá hiện tại",
    segments: [
      { label: "Đang diễn ra", value: 45, color: "#523F77" },
      { label: "Sắp kết thúc", value: 15, color: "#d4920a" },
      { label: "Hoàn thành", value: 35, color: "#1fa968" },
      { label: "Đã hủy", value: 5, color: "#FF2247" },
    ],
  },
  newProducts: {
    type: "bar",
    title: "Sản phẩm mới",
    subtitle: "Đăng tải mỗi ngày",
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    values: [120, 145, 132, 168, 155, 190, 142],
    unit: "sản phẩm",
    color: "#B6A5CE",
  },
};

export const getAdminRole = () => {
  const stored = localStorage.getItem("adminRole");
  if (stored && ADMIN_ROLES[stored]) return stored;
  return ADMIN_ROLES.SUPER_ADMIN;
};

export const setAdminRole = (role) => {
  localStorage.setItem("adminRole", role);
};

export const canAccessModule = (moduleId, role = getAdminRole()) =>
  MODULE_PERMISSIONS[moduleId]?.includes(role) ?? false;

export const getFilteredMenuSections = (role = getAdminRole()) =>
  adminMenuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessModule(item.id, role)),
    }))
    .filter((section) => section.items.length > 0);
