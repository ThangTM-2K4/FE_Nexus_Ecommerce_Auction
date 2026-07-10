export const sidebarMenuItems = [
  { id: "overview", label: "Tổng quan", icon: "grid", path: "/seller-hub/overview" },
  {
    id: "shop-management",
    label: "Quản Lý Shop",
    icon: "store",
    children: [
      { id: "shop-rating", label: "Đánh Giá Shop", path: "/seller-hub/shop-rating" },
      { id: "shop-profile", label: "Hồ Sơ Shop", path: "/seller-hub/shop-profile" },
      { id: "shop-decoration", label: "Trang Trí Shop", path: "/seller-hub/shop-decoration" },
      { id: "shop-categories", label: "Danh Mục Của Shop", path: "/seller-hub/shop-categories" },
      { id: "media-library", label: "Kho Hình Ảnh/Video", path: "/seller-hub/media-library" },
      { id: "my-reports", label: "Báo Cáo Của Tôi", path: "/seller-hub/my-reports" },
      { id: "products", label: "Sản phẩm", path: "/seller-hub/products" },
    ],
  },
  {
    id: "shipping",
    label: "Vận Chuyển",
    icon: "truck",
    children: [
      { id: "shipping", label: "Quản Lý Vận Chuyển", path: "/seller-hub/shipping" },
      { id: "shipping-batch", label: "Giao Hàng Loạt", path: "/seller-hub/shipping-batch" },
      { id: "shipping-settings", label: "Cài Đặt Vận Chuyển", path: "/seller-hub/shipping-settings" },
    ],
  },
  {
    id: "order-management",
    label: "Quản Lý Đơn Hàng",
    icon: "cart",
    children: [
      { id: "orders", label: "Tất cả", path: "/seller-hub/orders" },
      { id: "orders-cancelled", label: "Đơn huỷ", path: "/seller-hub/orders-cancelled" },
      { id: "orders-returns", label: "Trả Hàng/Hoàn Tiền", path: "/seller-hub/orders-returns" },
    ],
  },
  {
    id: "sales",
    label: "Bán Hàng",
    icon: "users",
    children: [
      { id: "customers", label: "Khách hàng", path: "/seller-hub/customers" },
      { id: "performance", label: "Hiệu quả bán hàng", path: "/seller-hub/performance" },
    ],
  },
  {
    id: "finance",
    label: "Tài Chính",
    icon: "wallet",
    children: [
      { id: "revenue", label: "Doanh thu", path: "/seller-hub/revenue" },
      { id: "wallet", label: "Ví & thanh toán", path: "/seller-hub/wallet" },
    ],
  },
  {
    id: "customer-care",
    label: "Chăm Sóc Khách Hàng",
    icon: "star",
    children: [
      { id: "reviews", label: "Đánh giá", path: "/seller-hub/reviews" },
      { id: "notifications", label: "Thông báo", path: "/seller-hub/notifications" },
    ],
  },
  {
    id: "shop-settings",
    label: "Thiết Lập Shop",
    icon: "settings",
    children: [
      { id: "general-settings", label: "Cài Đặt Chung", path: "/seller-hub/general-settings" },
    ],
  },
  { id: "help", label: "Trợ Giúp", icon: "help", path: "/seller-hub/help" },
];

export const categoryStaffInfo = {
  email: "nganhang.dienthoai@shopee.vn",
  updatedAt: "15:40 30/05/2023",
};

export const shopRatingSummary = {
  overallScore: 4.8,
  totalRatings: 3260,
  responseRate: 96,
  responseTime: "vài giờ",
  shipOnTimeRate: 98,
  violations: 0,
};

export const shopDecorationSections = [
  { id: "banner", label: "Banner trang Shop", active: true, note: "Hiển thị ở đầu trang Shop" },
  { id: "featured", label: "Sản phẩm nổi bật", active: true, note: "Tối đa 8 sản phẩm ghim" },
  { id: "voucher", label: "Mã giảm giá Shop", active: false, note: "Chưa có voucher nào đang chạy" },
  { id: "collection", label: "Bộ sưu tập theo mùa", active: false, note: "Gom nhóm sản phẩm theo chủ đề" },
];

export const myReports = [
  { id: "r1", name: "Báo cáo doanh thu", desc: "Doanh thu, phí sàn và lợi nhuận theo ngày", linkLabel: "Xem Doanh thu", path: "/seller-hub/revenue" },
  { id: "r2", name: "Báo cáo đơn hàng", desc: "Tình trạng và tỉ lệ hoàn thành đơn hàng", linkLabel: "Xem Đơn hàng", path: "/seller-hub/orders" },
  { id: "r3", name: "Báo cáo hiệu quả sản phẩm", desc: "Sản phẩm bán chạy, tồn kho, lượt xem", linkLabel: "Xem Sản phẩm", path: "/seller-hub/products" },
];

export const shippingSettingsOptions = [
  { id: "ghn", label: "Giao Hàng Nhanh (GHN)", type: "standard", desc: "2-4 ngày", basePrice: 15000, pricePerKm: 2500, fee: "20.000đ", enabled: true },
  { id: "ghtk", label: "Giao Hàng Tiết Kiệm (GHTK)", type: "standard", desc: "3-5 ngày", basePrice: 12000, pricePerKm: 2000, fee: "16.000đ", enabled: true },
  { id: "jt", label: "J&T Express", type: "standard", desc: "1-3 ngày", basePrice: 18000, pricePerKm: 2800, fee: "22.000đ", enabled: false },
  { id: "viettelpost", label: "Viettel Post", type: "standard", desc: "2-4 ngày", basePrice: 14000, pricePerKm: 2200, fee: "18.000đ", enabled: false },
  { id: "grab", label: "Grab Express", type: "instant", desc: "Hoả tốc nội thành, 1-2 giờ", basePrice: 30000, pricePerKm: 5000, fee: "45.000đ", enabled: false },
  { id: "be", label: "Be Delivery", type: "instant", desc: "Hoả tốc nội thành, 1-2 giờ", basePrice: 25000, pricePerKm: 4500, fee: "40.000đ", enabled: false },
  { id: "xanhsm", label: "Xanh SM Ship", type: "instant", desc: "Hoả tốc nội thành, 1-2 giờ", basePrice: 28000, pricePerKm: 4800, fee: "42.000đ", enabled: false },
  { id: "loship", label: "Loship", type: "instant", desc: "Giao trong ngày, nội thành", basePrice: 20000, pricePerKm: 3500, fee: "35.000đ", enabled: false },
  { id: "freeship", label: "Miễn phí vận chuyển từ 500.000đ", type: "promo", desc: "Áp dụng đơn từ 500.000đ", basePrice: 0, pricePerKm: 0, fee: "0đ", enabled: false },
];

export const generalSettingsOptions = [
  { id: "vacationMode", label: "Chế độ tạm nghỉ (ẩn Shop khỏi tìm kiếm)", enabled: false },
  { id: "autoReply", label: "Tự động trả lời tin nhắn khi vắng mặt", enabled: true },
  { id: "showRating", label: "Hiển thị điểm đánh giá Shop công khai", enabled: true },
];

export const helpTopics = [
  { id: "t1", question: "Làm sao để cập nhật thông tin thuế?", hint: "Vào Hồ Sơ Shop > Thông tin Thuế", path: "/seller-hub/shop-profile" },
  { id: "t2", question: "Khi nào tôi nhận được tiền bán hàng?", hint: "Xem chi tiết tại Ví & thanh toán", path: "/seller-hub/wallet" },
  { id: "t3", question: "Vì sao đơn hàng của tôi bị hủy?", hint: "Kiểm tra trạng thái tại Đơn hàng", path: "/seller-hub/orders" },
  { id: "t4", question: "Làm sao để đổi phí vận chuyển?", hint: "Cấu hình tại Cài Đặt Vận Chuyển", path: "/seller-hub/shipping-settings" },
];

export const overviewStats = [
  { id: "total-revenue", label: "Tổng doanh thu", value: "12.500.000.000đ", trend: "+12.4%", group: "revenue" },
  { id: "today-revenue", label: "Doanh thu hôm nay", value: "48.200.000đ", trend: "+5.1%", group: "revenue" },
  { id: "month-revenue", label: "Doanh thu tháng này", value: "1.280.000.000đ", trend: "+8.7%", group: "revenue" },
  { id: "total-orders", label: "Tổng số đơn hàng", value: "2.350", trend: "+3.2%", group: "orders" },
  { id: "new-orders", label: "Đơn hàng mới", value: "42", trend: "Hôm nay", group: "orders" },
  { id: "processing-orders", label: "Đơn hàng đang xử lý", value: "18", group: "orders" },
  { id: "completed-orders", label: "Đơn hàng hoàn thành", value: "2.198", trend: "93.5%", group: "orders" },
  { id: "cancelled-orders", label: "Đơn hàng bị hủy", value: "87", trend: "3.7%", group: "orders", negative: true },
  { id: "total-products", label: "Tổng số sản phẩm", value: "156", group: "products" },
  { id: "active-products", label: "Sản phẩm đang bán", value: "128", group: "products" },
  { id: "out-of-stock", label: "Sản phẩm hết hàng", value: "14", group: "products", negative: true },
  { id: "total-customers", label: "Tổng khách hàng", value: "1.842", trend: "+24", group: "customers" },
  { id: "new-customers", label: "Khách mới (30 ngày)", value: "124", trend: "+18%", group: "customers" },
  { id: "returning-customers", label: "Khách quay lại", value: "618", trend: "33.6%", group: "customers" },
  { id: "vip-customers", label: "Khách VIP", value: "48", group: "customers" },
  { id: "total-views", label: "Tổng lượt xem SP", value: "284.500", trend: "+18%", group: "traffic" },
  { id: "total-bids", label: "Tổng lượt đấu giá", value: "12.480", trend: "+9.3%", group: "traffic" },
  { id: "conversion", label: "Tỷ lệ chuyển đổi", value: "4.8%", trend: "+0.3%", group: "traffic" },
];

export const revenueSummary = {
  grossRevenue: 1280000000,
  netRevenue: 1152000000,
  commissionFee: 89600000,
  refundAmount: 38400000,
  profit: 1025600000,
};

export const revenueTrend = [
  { label: "T2", value: 62 },
  { label: "T3", value: 78 },
  { label: "T4", value: 71 },
  { label: "T5", value: 88 },
  { label: "T6", value: 95 },
  { label: "T7", value: 82 },
  { label: "CN", value: 100 },
];

export const revenueByCategory = [
  { label: "Điện tử", value: 38, amount: "486M" },
  { label: "Thời trang", value: 24, amount: "307M" },
  { label: "Đồng hồ", value: 18, amount: "230M" },
  { label: "Nghệ thuật", value: 12, amount: "154M" },
  { label: "Khác", value: 8, amount: "103M" },
];

export const revenueByProduct = [
  { label: "Rolex Submariner", value: 92 },
  { label: "iPhone 16 Pro", value: 78 },
  { label: "Omega Speedmaster", value: 65 },
  { label: "MacBook Pro M3", value: 54 },
  { label: "Pokémon Charizard", value: 41 },
];

export const productStats = {
  total: 156,
  active: 128,
  outOfStock: 14,
  locked: 6,
  pending: 8,
};

export const topProducts = {
  bestSelling: [
    { name: "Tai nghe Bluetooth Pro X2", sold: 342, revenue: "445M" },
    { name: "Đồng hồ Urban Fit", sold: 218, revenue: "412M" },
    { name: "Balo laptop 15.6\"", sold: 189, revenue: "130M" },
  ],
  mostViewed: [
    { name: "iPhone 16 Pro 256GB", views: 18420, rating: 4.9 },
    { name: "Rolex Submariner", views: 15230, rating: 4.8 },
    { name: "MacBook Air M3", views: 12840, rating: 4.7 },
  ],
  highestProfit: [
    { name: "Tranh sơn dầu cổ điển", profit: "89M", margin: "42%" },
    { name: "Leica M11", profit: "76M", margin: "35%" },
    { name: "Patek Philippe", profit: "68M", margin: "31%" },
  ],
  mostFavorited: [
    { name: "Giày sneaker runner pulse", favorites: 1240 },
    { name: "Áo khoác denim premium", favorites: 980 },
    { name: "Loa mini karaoke", favorites: 865 },
  ],
};

export const productList = [
  { name: "Rolex Submariner Date", sku: "RLX-001", price: "285.000.000đ", stock: 2, sold: 8, views: 15230, rating: 4.9 },
  { name: "iPhone 16 Pro 256GB", sku: "IP16-256", price: "28.990.000đ", stock: 45, sold: 124, views: 18420, rating: 4.8 },
  { name: "Omega Speedmaster", sku: "OMG-772", price: "142.000.000đ", stock: 0, sold: 5, views: 9840, rating: 4.7 },
  { name: "MacBook Pro M3 14\"", sku: "MBP-M3", price: "42.990.000đ", stock: 12, sold: 67, views: 11200, rating: 4.9 },
  { name: "Pokémon Charizard 1st Ed", sku: "PKM-CHZ", price: "18.500.000đ", stock: 1, sold: 3, views: 7650, rating: 5.0 },
];

export const lowStockAlerts = productList
  .filter((p) => p.stock <= 5)
  .map((p) => ({ sku: p.sku, name: p.name, stock: p.stock }));

export const orderStats = {
  pending: 12,
  confirmed: 8,
  shipping: 14,
  delivered: 22,
  completed: 2198,
  cancelled: 87,
  refunded: 9,
  total: 2350,
  completionRate: 93.5,
  cancelRate: 3.7,
  aov: 5446809,
};

export const customerStats = {
  total: 1842,
  newCustomers: 124,
  returning: 618,
  vip: 48,
  retentionRate: 33.6,
  repeatPurchaseRate: 28.4,
  avgCustomerValue: 6948000,
};

export const topCustomers = [
  { name: "Nguyễn Văn An", orders: 28, spent: "186.400.000đ" },
  { name: "Trần Thị Bình", orders: 22, spent: "142.800.000đ" },
  { name: "Lê Minh Cường", orders: 19, spent: "98.500.000đ" },
  { name: "Phạm Thu Hà", orders: 17, spent: "76.200.000đ" },
];

export const conversionFunnel = [
  { label: "Lượt xem sản phẩm", value: 10000, rate: null },
  { label: "Lượt click", value: 1000, rate: "10%" },
  { label: "Thêm vào giỏ", value: 300, rate: "30%" },
  { label: "Thanh toán", value: 180, rate: "60%" },
  { label: "Mua thành công", value: 150, rate: "83.3%" },
];

export const salesKpis = [
  { label: "Tỷ lệ chuyển đổi", value: "4.8%", change: "+0.3%" },
  { label: "Click Through Rate", value: "10.0%", change: "+1.2%" },
  { label: "Tỷ lệ bỏ giỏ hàng", value: "16.7%", change: "-2.1%", negative: true },
];

export const reviewSummary = {
  averageRating: 4.7,
  totalReviews: 1842,
  fiveStar: 1420,
  oneStar: 38,
};

export const recentReviews = [
  { user: "Minh Tuấn", product: "Rolex Submariner", rating: 5, comment: "Sản phẩm chính hãng, giao hàng nhanh.", time: "2 giờ trước" },
  { user: "Lan Anh", product: "iPhone 16 Pro", rating: 4, comment: "Hài lòng với chất lượng.", time: "5 giờ trước" },
  { user: "Hoàng Nam", product: "Omega Speedmaster", rating: 5, comment: "Đóng gói cẩn thận, đúng mô tả.", time: "1 ngày trước" },
];

export const complaints = [
  { user: "Đức Phong", issue: "Giao chậm 2 ngày", product: "Balo laptop", status: "Đang xử lý" },
  { user: "Thu Hương", issue: "Màu sắc khác ảnh", product: "Áo khoác denim", status: "Mới" },
];

export const flaggedProducts = [
  { name: "Loa mini karaoke", complaints: 4, rating: 3.2 },
  { name: "Ốp lưng điện thoại", complaints: 3, rating: 3.5 },
];

export const sellerNotifications = [
  { type: "order", title: "Đơn hàng mới #ORD-2847", message: "Khách vừa đặt iPhone 16 Pro — 28.990.000đ", time: "5 phút", unread: true },
  { type: "stock", title: "Sắp hết hàng", message: "Omega Speedmaster còn 0 sản phẩm", time: "1 giờ", unread: true },
  { type: "reject", title: "Sản phẩm bị từ chối", message: "SKU-8821 không đạt tiêu chuẩn ảnh", time: "3 giờ", unread: false },
  { type: "complaint", title: "Khiếu nại mới", message: "Khách phản ánh giao hàng chậm", time: "5 giờ", unread: true },
  { type: "payment", title: "Thanh toán thành công", message: "Đã nhận 42.500.000đ từ đơn #ORD-2839", time: "8 giờ", unread: false },
  { type: "auction", title: "Phiên đấu giá kết thúc", message: "Rolex Submariner — thắng 312.000.000đ", time: "1 ngày", unread: false },
];

export const walletStats = {
  availableBalance: 245800000,
  pendingBalance: 68400000,
  withdrawnAmount: 892000000,
};

export const transactions = [
  { id: "TXN-9012", type: "in", desc: "Thanh toán đơn #ORD-2847", amount: 28990000, date: "11/06/2026" },
  { id: "TXN-9011", type: "in", desc: "Thanh toán đơn #ORD-2840", amount: 42500000, date: "10/06/2026" },
  { id: "TXN-9010", type: "out", desc: "Rút tiền về ngân hàng", amount: -150000000, date: "09/06/2026" },
  { id: "TXN-9009", type: "fee", desc: "Phí hoa hồng tháng 5", amount: -8960000, date: "08/06/2026" },
];

export const withdrawals = [
  { id: "WD-441", amount: 150000000, status: "Hoàn thành", date: "09/06/2026" },
  { id: "WD-440", amount: 200000000, status: "Hoàn thành", date: "25/05/2026" },
  { id: "WD-439", amount: 100000000, status: "Đang xử lý", date: "11/06/2026" },
];

export const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

export const formatCompactCurrency = (value) => {
  const abs = Math.abs(value);
  const fmt = (n, suffix) =>
    `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(n)} ${suffix}`;

  if (abs >= 1_000_000_000) return fmt(value / 1_000_000_000, "tỷ");
  if (abs >= 1_000_000) return fmt(value / 1_000_000, "tr");
  if (abs >= 10_000) return fmt(value / 1_000, "nghìn");
  return formatCurrency(value);
};

export const walletConfig = {
  minWithdraw: 100_000,
  maxWithdraw: 500_000_000,
  feePercent: 0,
  processingDays: "1–3 ngày làm việc",
};

//=====================================================
// Vận chuyển & Đơn hàng (dùng chung cho Quản lý đơn hàng,
// Quản lý vận chuyển và Giao hàng loạt)
//=====================================================

export const shippingCarriers = [
  { code: "ghn", name: "Giao Hàng Nhanh (GHN)" },
  { code: "ghtk", name: "Giao Hàng Tiết Kiệm (GHTK)" },
  { code: "jt", name: "J&T Express" },
  { code: "viettelpost", name: "Viettel Post" },
  { code: "grab", name: "Grab Express" },
];

// Canonical, chi tiết danh sách đơn hàng của Shop.
export const sellerOrders = [
  {
    id: "ORD-2847", customer: "Nguyễn Văn An", phone: "0901 234 567",
    address: "12 Nguyễn Huệ, Q.1, TP.HCM", product: "iPhone 16 Pro 256GB",
    image: "/images/auction/iphone.jpg", qty: 1, amount: 28990000, shippingFee: 20000,
    carrier: "ghn", tracking: "GHN284700VN", status: "Pending", date: "11/06/2026 14:32",
  },
  {
    id: "ORD-2846", customer: "Trần Thị Bình", phone: "0912 345 678",
    address: "45 Lê Lợi, Q. Hải Châu, Đà Nẵng", product: "Rolex Submariner Date",
    image: "/images/auction/rolex.jpg", qty: 1, amount: 285000000, shippingFee: 0,
    carrier: "viettelpost", tracking: "VTP284600VN", status: "Shipping", date: "11/06/2026 11:08",
  },
  {
    id: "ORD-2845", customer: "Lê Minh Cường", phone: "0923 456 789",
    address: "78 Trần Hưng Đạo, Q. Hoàn Kiếm, Hà Nội", product: 'MacBook Pro M3 14"',
    image: "/images/auction/macbook.jpg", qty: 1, amount: 42990000, shippingFee: 22000,
    carrier: "jt", tracking: "JT284500VN", status: "Confirmed", date: "10/06/2026 20:15",
  },
  {
    id: "ORD-2844", customer: "Phạm Thu Hà", phone: "0934 567 890",
    address: "23 Hai Bà Trưng, Q.3, TP.HCM", product: "Omega Speedmaster",
    image: "/images/auction/omega.jpg", qty: 1, amount: 142000000, shippingFee: 0,
    carrier: "ghn", tracking: "GHN284400VN", status: "Delivered", date: "10/06/2026 09:42",
  },
  {
    id: "ORD-2843", customer: "Hoàng Nam", phone: "0945 678 901",
    address: "56 Nguyễn Trãi, Q.5, TP.HCM", product: "Pokémon Charizard 1st Ed",
    image: "/images/auction/pokemon.jpg", qty: 2, amount: 18500000, shippingFee: 16000,
    carrier: "ghtk", tracking: "GHTK284300VN", status: "Completed", date: "09/06/2026 16:20",
  },
  {
    id: "ORD-2842", customer: "Lan Anh", phone: "0956 789 012",
    address: "89 Điện Biên Phủ, Q. Bình Thạnh, TP.HCM", product: "Leica M11",
    image: "/images/auction/leica.jpg", qty: 1, amount: 198000000, shippingFee: 0,
    carrier: "viettelpost", tracking: "VTP284200VN", status: "Completed", date: "09/06/2026 10:05",
  },
  {
    id: "ORD-2841", customer: "Đỗ Quang Huy", phone: "0967 890 123",
    address: "101 Cách Mạng Tháng 8, Q.10, TP.HCM", product: "Sony A7 IV Body",
    image: "/images/auction/leica.jpg", qty: 1, amount: 52990000, shippingFee: 22000,
    carrier: "jt", tracking: "JT284100VN", status: "AwaitingPickup", date: "11/06/2026 08:50",
  },
  {
    id: "ORD-2840", customer: "Vũ Thị Mai", phone: "0978 901 234",
    address: "202 Lạc Long Quân, Q. Tây Hồ, Hà Nội", product: "iPad Pro M4 11\"",
    image: "/images/auction/iphone.jpg", qty: 1, amount: 24990000, shippingFee: 20000,
    carrier: "ghn", tracking: "GHN284000VN", status: "AwaitingPickup", date: "11/06/2026 07:12",
  },
  {
    id: "ORD-2839", customer: "Bùi Đức Phong", phone: "0989 012 345",
    address: "303 Nguyễn Văn Cừ, Q. Long Biên, Hà Nội", product: "Balo laptop Targus",
    image: "/images/auction/macbook.jpg", qty: 3, amount: 2400000, shippingFee: 16000,
    carrier: "ghtk", tracking: "GHTK283900VN", status: "Cancelled", date: "08/06/2026 19:30",
  },
  {
    id: "ORD-2838", customer: "Ngô Thanh Thủy", phone: "0900 123 456",
    address: "404 Phan Đình Phùng, TP. Huế", product: "Áo khoác denim",
    image: "/images/auction/pokemon.jpg", qty: 1, amount: 890000, shippingFee: 16000,
    carrier: "ghtk", tracking: "GHTK283800VN", status: "Refunded", date: "07/06/2026 15:00",
  },
  {
    id: "ORD-2837", customer: "Trịnh Văn Sơn", phone: "0911 223 344",
    address: "505 Trường Chinh, Q. Thanh Xuân, Hà Nội", product: "Đồng hồ Casio G-Shock",
    image: "/images/auction/omega.jpg", qty: 1, amount: 3200000, shippingFee: 18000,
    carrier: "viettelpost", tracking: "VTP283700VN", status: "Shipping", date: "10/06/2026 13:20",
  },
  {
    id: "ORD-2836", customer: "Đặng Thu Trang", phone: "0922 334 455",
    address: "606 Võ Văn Kiệt, Q.6, TP.HCM", product: "Tai nghe Sony WH-1000XM5",
    image: "/images/auction/leica.jpg", qty: 1, amount: 7990000, shippingFee: 20000,
    carrier: "ghn", tracking: "GHN283600VN", status: "Confirmed", date: "10/06/2026 09:00",
  },
];

// Timeline mẫu theo trạng thái — hiển thị trong chi tiết đơn.
export const orderTimeline = (status) => {
  const base = [
    { key: "Pending", label: "Đơn hàng được đặt" },
    { key: "Confirmed", label: "Người bán xác nhận" },
    { key: "AwaitingPickup", label: "Chờ đơn vị vận chuyển lấy hàng" },
    { key: "Shipping", label: "Đang giao đến người mua" },
    { key: "Delivered", label: "Đã giao hàng thành công" },
    { key: "Completed", label: "Đơn hàng hoàn tất" },
  ];
  if (status === "Cancelled") return [...base.slice(0, 1), { key: "Cancelled", label: "Đơn hàng đã hủy" }];
  if (status === "Refunded")
    return [...base.slice(0, 4), { key: "Refunded", label: "Đã hoàn trả / hoàn tiền" }];
  const idx = base.findIndex((s) => s.key === status);
  return base.map((s, i) => ({ ...s, done: i <= idx }));
};

//=====================================================
// Đánh giá Shop — kèm bình luận của người mua (Task 4)
//=====================================================

export const shopReviews = [
  {
    id: "RV-1042", user: "Minh Tuấn", avatar: "MT", rating: 5, product: "Rolex Submariner Date",
    comment: "Sản phẩm chính hãng, đóng gói chắc chắn, giao nhanh hơn dự kiến. Sẽ ủng hộ shop dài dài!",
    images: 2, time: "2 giờ trước", reply: null, likes: 12,
  },
  {
    id: "RV-1041", user: "Lan Anh", avatar: "LA", rating: 4, product: "iPhone 16 Pro 256GB",
    comment: "Máy đẹp, pin trâu. Trừ 1 sao vì hộp hơi móp nhẹ khi nhận, còn lại rất hài lòng.",
    images: 1, time: "5 giờ trước", reply: null, likes: 5,
  },
  {
    id: "RV-1040", user: "Hoàng Nam", avatar: "HN", rating: 5, product: "Omega Speedmaster",
    comment: "Đóng gói cẩn thận, đúng mô tả, tư vấn nhiệt tình. Cảm ơn shop!",
    images: 0, time: "1 ngày trước",
    reply: "Cảm ơn anh Nam đã tin tưởng shop ạ!", likes: 8,
  },
  {
    id: "RV-1039", user: "Thu Hương", avatar: "TH", rating: 2, product: "Áo khoác denim",
    comment: "Màu ngoài thực tế hơi khác so với ảnh, chất vải ổn nhưng form hơi rộng.",
    images: 3, time: "2 ngày trước", reply: null, likes: 1,
  },
  {
    id: "RV-1038", user: "Đức Phong", avatar: "ĐP", rating: 3, product: "Balo laptop Targus",
    comment: "Hàng ok nhưng giao chậm 2 ngày so với hẹn. Mong shop cải thiện khâu vận chuyển.",
    images: 0, time: "3 ngày trước", reply: null, likes: 3,
  },
  {
    id: "RV-1037", user: "Quỳnh Chi", avatar: "QC", rating: 5, product: 'MacBook Pro M3 14"',
    comment: "Máy nguyên seal, hoạt động mượt. Shop hỗ trợ trả góp nhanh gọn.",
    images: 1, time: "4 ngày trước", reply: null, likes: 9,
  },
];

export const reviewRatingBreakdown = [
  { star: 5, count: 1420 },
  { star: 4, count: 286 },
  { star: 3, count: 68 },
  { star: 2, count: 30 },
  { star: 1, count: 38 },
];

//=====================================================
// Báo cáo của tôi (Task 5)
//=====================================================

export const reportCatalog = [
  {
    id: "balance", name: "Báo cáo số dư", icon: "wallet",
    desc: "Số dư khả dụng, số dư đang chờ và dòng tiền vào/ra của Shop.",
    period: "Cập nhật theo thời gian thực",
  },
  {
    id: "income", name: "Báo cáo thu nhập", icon: "chart",
    desc: "Doanh thu, phí sàn, phí vận chuyển và lợi nhuận ròng theo kỳ.",
    period: "Theo ngày / tuần / tháng",
  },
  {
    id: "marketing", name: "Báo cáo marketing", icon: "target",
    desc: "Hiệu quả voucher, quảng cáo, lượt tiếp cận và tỉ lệ chuyển đổi.",
    period: "Theo chiến dịch",
  },
  {
    id: "sales", name: "Báo cáo phân tích bán hàng", icon: "box",
    desc: "Sản phẩm bán chạy, tồn kho, xu hướng theo danh mục.",
    period: "Theo ngày / tháng",
  },
  {
    id: "orders-export", name: "Xuất đơn hàng", icon: "cart",
    desc: "Xuất toàn bộ đơn hàng ra file CSV theo khoảng thời gian đã chọn.",
    period: "Tùy chọn khoảng ngày",
  },
  {
    id: "shipping-labels", name: "Phiếu gửi hàng đã in", icon: "truck",
    desc: "Lịch sử các phiếu gửi hàng đã in, in lại hoặc tải xuống.",
    period: "30 ngày gần nhất",
  },
];

export const printedShippingLabels = [
  { id: "SPX-77120", order: "ORD-2846", carrier: "Viettel Post", printedAt: "11/06/2026 11:20", pages: 1 },
  { id: "SPX-77118", order: "ORD-2844", carrier: "Giao Hàng Nhanh", printedAt: "10/06/2026 10:02", pages: 1 },
  { id: "SPX-77115", order: "ORD-2843", carrier: "Giao Hàng Tiết Kiệm", printedAt: "09/06/2026 16:45", pages: 2 },
  { id: "SPX-77110", order: "ORD-2837", carrier: "Viettel Post", printedAt: "10/06/2026 13:40", pages: 1 },
];

export const marketingReport = {
  campaigns: [
    { name: "Flash Sale 6.6", reach: 128000, clicks: 9400, orders: 312, spend: 4200000, revenue: 186000000 },
    { name: "Voucher Freeship", reach: 86000, clicks: 6100, orders: 204, spend: 1800000, revenue: 98000000 },
    { name: "Quảng cáo tìm kiếm", reach: 54000, clicks: 3800, orders: 96, spend: 2600000, revenue: 62000000 },
  ],
};

export const recentOrders = [
  {
    id: "ORD-2847",
    customer: "Nguyễn Văn An",
    product: "iPhone 16 Pro 256GB",
    image: "/images/auction/iphone.jpg",
    amount: 28990000,
    status: "Pending",
    date: "11/06/2026 14:32",
  },
  {
    id: "ORD-2846",
    customer: "Trần Thị Bình",
    product: "Rolex Submariner Date",
    image: "/images/auction/rolex.jpg",
    amount: 285000000,
    status: "Shipping",
    date: "11/06/2026 11:08",
  },
  {
    id: "ORD-2845",
    customer: "Lê Minh Cường",
    product: "MacBook Pro M3 14\"",
    image: "/images/auction/macbook.jpg",
    amount: 42990000,
    status: "Confirmed",
    date: "10/06/2026 20:15",
  },
  {
    id: "ORD-2844",
    customer: "Phạm Thu Hà",
    product: "Omega Speedmaster",
    image: "/images/auction/omega.jpg",
    amount: 142000000,
    status: "Delivered",
    date: "10/06/2026 09:42",
  },
  {
    id: "ORD-2843",
    customer: "Hoàng Nam",
    product: "Pokémon Charizard 1st Ed",
    image: "/images/auction/pokemon.jpg",
    amount: 18500000,
    status: "Completed",
    date: "09/06/2026 16:20",
  },
  {
    id: "ORD-2842",
    customer: "Lan Anh",
    product: "Leica M11",
    image: "/images/auction/leica.jpg",
    amount: 198000000,
    status: "Completed",
    date: "09/06/2026 10:05",
  },
];

export const ordersByDay = [
  { day: "T2", orders: 28, revenue: 186000000 },
  { day: "T3", orders: 34, revenue: 224000000 },
  { day: "T4", orders: 31, revenue: 198000000 },
  { day: "T5", orders: 42, revenue: 312000000 },
  { day: "T6", orders: 38, revenue: 276000000 },
  { day: "T7", orders: 45, revenue: 348000000 },
  { day: "CN", orders: 36, revenue: 268000000 },
];

export const customerSegments = [
  { segment: "VIP", count: 48, spend: "1.240.000.000đ", growth: "+12%" },
  { segment: "Quay lại", count: 618, spend: "2.860.000.000đ", growth: "+8%" },
  { segment: "Mới (30 ngày)", count: 124, spend: "420.000.000đ", growth: "+24%" },
  { segment: "Tiềm năng", count: 312, spend: "680.000.000đ", growth: "+5%" },
  { segment: "Không hoạt động", count: 740, spend: "120.000.000đ", growth: "-3%", negative: true },
];

export const recentCustomers = [
  { name: "Vũ Thị Mai", email: "mai.vu@gmail.com", orders: 1, avatar: "/images/auction/avatar-1.jpg", joined: "11/06/2026" },
  { name: "Đỗ Quang Huy", email: "huy.do@gmail.com", orders: 2, avatar: "/images/auction/avatar-2.jpg", joined: "10/06/2026" },
  { name: "Bùi Ngọc Linh", email: "linh.bui@gmail.com", orders: 1, avatar: "/images/auction/avatar-3.jpg", joined: "10/06/2026" },
  { name: "Phan Đức Anh", email: "anh.phan@gmail.com", orders: 3, avatar: "/images/auction/avatar-4.jpg", joined: "09/06/2026" },
  { name: "Ngô Thanh Tùng", email: "tung.ngo@gmail.com", orders: 1, avatar: "/images/auction/avatar-5.jpg", joined: "09/06/2026" },
];

export const channelPerformance = [
  { channel: "Tìm kiếm nội bộ", views: 42000, clicks: 5200, conversion: "3.8%", revenue: "486.000.000đ" },
  { channel: "Đấu giá trực tiếp", views: 28400, clicks: 4100, conversion: "5.2%", revenue: "312.000.000đ" },
  { channel: "Gợi ý sản phẩm", views: 18600, clicks: 2200, conversion: "2.9%", revenue: "198.000.000đ" },
  { channel: "Email marketing", views: 8200, clicks: 1640, conversion: "6.1%", revenue: "124.000.000đ" },
  { channel: "Mạng xã hội", views: 12800, clicks: 980, conversion: "1.8%", revenue: "86.000.000đ" },
];

export const topClickedProducts = [
  { name: "iPhone 16 Pro", image: "/images/auction/iphone.jpg", clicks: 2840, ctr: "12.4%" },
  { name: "Rolex Submariner", image: "/images/auction/rolex.jpg", clicks: 2120, ctr: "10.8%" },
  { name: "MacBook Pro M3", image: "/images/auction/macbook.jpg", clicks: 1860, ctr: "9.6%" },
  { name: "Omega Speedmaster", image: "/images/auction/omega.jpg", clicks: 1540, ctr: "8.2%" },
];

export const notificationSummary = {
  unread: 4,
  today: 6,
  orders: 2,
  stock: 1,
  complaints: 1,
};

export const ratingDistribution = [
  { stars: 5, count: 1420, percent: 77 },
  { stars: 4, count: 298, percent: 16 },
  { stars: 3, count: 86, percent: 5 },
  { stars: 2, count: 32, percent: 2 },
  { stars: 1, count: 38, percent: 2 },
];

export const reviewedProducts = [
  { name: "Rolex Submariner", image: "/images/auction/rolex.jpg", rating: 4.9, reviews: 128 },
  { name: "iPhone 16 Pro", image: "/images/auction/iphone.jpg", rating: 4.8, reviews: 214 },
  { name: "MacBook Pro M3", image: "/images/auction/macbook.jpg", rating: 4.7, reviews: 96 },
  { name: "Leica M11", image: "/images/auction/leica.jpg", rating: 4.9, reviews: 42 },
];
