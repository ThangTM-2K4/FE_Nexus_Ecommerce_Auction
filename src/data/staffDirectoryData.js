// Dữ liệu cho các trang quản lý mới của Staff Hub:
// Thông tin người bán, Quản lý người dùng, Nhật ký hoạt động.

// Ảnh sản phẩm giữ chỗ (SVG màu, không cần file thật)
const productPlaceholder = (label, bg = "#dcd3ef") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6b6280" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
  )}`;

// ── THÔNG TIN NGƯỜI BÁN ── Danh bạ seller: hồ sơ đầy đủ + sản phẩm đang bán.
// staffService.getSellerDirectory() gộp thêm seller thật từ localStorage.
export const sellerDirectory = [
  {
    id: "SELLER-01",
    userId: "u-101",
    shopName: "An's Luxury Store",
    ownerName: "Nguyễn Văn An",
    email: "an.nguyen@gmail.com",
    phone: "0901234567",
    category: "Đồng hồ & Trang sức",
    businessType: "Cá nhân",
    cccdNumber: "079089001234",
    cccdVerified: true,
    taxCode: "8901234567",
    address: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    bankName: "Vietcombank",
    accountNumber: "0071000123456",
    accountHolder: "NGUYEN VAN AN",
    status: "APPROVED",
    joinedAt: "12/03/2026",
    rating: 4.8,
    reviewCount: 1284,
    totalOrders: 863,
    revenue: 4820000000,
    products: [
      { id: "P-1001", name: "Rolex Datejust 41 Wimbledon", price: 285000000, stock: 2, sold: 14, status: "APPROVED", category: "Đồng hồ", image: productPlaceholder("Rolex") },
      { id: "P-1002", name: "Omega Speedmaster Moonwatch", price: 168000000, stock: 3, sold: 22, status: "APPROVED", category: "Đồng hồ", image: productPlaceholder("Omega") },
      { id: "P-1003", name: "Cartier Love Bracelet 18K", price: 142000000, stock: 5, sold: 31, status: "APPROVED", category: "Trang sức", image: productPlaceholder("Cartier") },
      { id: "P-1004", name: "Vòng tay kim cương 2ct", price: 320000000, stock: 1, sold: 3, status: "PENDING", category: "Trang sức", image: productPlaceholder("Kim cuong") },
    ],
  },
  {
    id: "SELLER-02",
    userId: "u-201",
    shopName: "TechZone",
    ownerName: "Trần Minh Thắng",
    email: "thang.tran@gmail.com",
    phone: "0912345678",
    category: "Điện tử & Công nghệ",
    businessType: "Doanh nghiệp",
    cccdNumber: "079091005678",
    cccdVerified: true,
    taxCode: "0312345678",
    address: "88 Cách Mạng Tháng 8, Quận 3, TP. Hồ Chí Minh",
    bankName: "VP Bank",
    accountNumber: "0336074367",
    accountHolder: "CONG TY TNHH TECHZONE",
    status: "APPROVED",
    joinedAt: "05/01/2026",
    rating: 4.6,
    reviewCount: 3521,
    totalOrders: 2140,
    revenue: 9260000000,
    products: [
      { id: "P-2001", name: "iPhone 16 Pro Max 256GB", price: 32500000, stock: 48, sold: 412, status: "APPROVED", category: "Điện thoại", image: productPlaceholder("iPhone") },
      { id: "P-2002", name: "MacBook Pro M4 Max 48GB", price: 98500000, stock: 12, sold: 87, status: "APPROVED", category: "Laptop", image: productPlaceholder("MacBook") },
      { id: "P-2003", name: "iPad Pro M4 13 inch", price: 28900000, stock: 24, sold: 156, status: "APPROVED", category: "Máy tính bảng", image: productPlaceholder("iPad") },
      { id: "P-2004", name: "Sony WH-1000XM5", price: 5200000, stock: 63, sold: 534, status: "APPROVED", category: "Âm thanh", image: productPlaceholder("Sony") },
      { id: "P-2005", name: "Bàn phím cơ Keychron Q1 Pro", price: 4590000, stock: 0, sold: 210, status: "REJECTED", category: "Phụ kiện", image: productPlaceholder("Keychron") },
    ],
  },
  {
    id: "SELLER-03",
    userId: "u-301",
    shopName: "ArtGallery HCM",
    ownerName: "Lê Minh Cường",
    email: "cuong.le@gmail.com",
    phone: "0923456789",
    category: "Sưu tầm & Nghệ thuật",
    businessType: "Doanh nghiệp",
    cccdNumber: "079085009012",
    cccdVerified: true,
    taxCode: "0398765432",
    address: "45 Lý Tự Trọng, Quận 1, TP. Hồ Chí Minh",
    bankName: "ACB",
    accountNumber: "0987654321",
    accountHolder: "CONG TY ARTGALLERY",
    status: "APPROVED",
    joinedAt: "22/02/2026",
    rating: 4.9,
    reviewCount: 412,
    totalOrders: 178,
    revenue: 3140000000,
    products: [
      { id: "P-3001", name: "Tranh sơn dầu 'Phố cổ' 1962", price: 145000000, stock: 1, sold: 1, status: "APPROVED", category: "Tranh", image: productPlaceholder("Tranh") },
      { id: "P-3002", name: "Đèn bàn cổ Art Deco 1930s", price: 32000000, stock: 2, sold: 5, status: "APPROVED", category: "Đồ cổ", image: productPlaceholder("Den co") },
      { id: "P-3003", name: "Tượng đồng Đông Sơn phục chế", price: 58000000, stock: 3, sold: 8, status: "APPROVED", category: "Tượng", image: productPlaceholder("Tuong") },
    ],
  },
  {
    id: "SELLER-04",
    userId: "u-401",
    shopName: "AudioHub",
    ownerName: "Phạm Quốc Huy",
    email: "huy.pham@gmail.com",
    phone: "0934567890",
    category: "Âm thanh & Nhạc cụ",
    businessType: "Cá nhân",
    cccdNumber: "079093002345",
    cccdVerified: false,
    taxCode: "—",
    address: "234 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh",
    bankName: "Techcombank",
    accountNumber: "19012345678",
    accountHolder: "PHAM QUOC HUY",
    status: "PENDING",
    joinedAt: "09/07/2026",
    rating: 0,
    reviewCount: 0,
    totalOrders: 0,
    revenue: 0,
    products: [
      { id: "P-4001", name: "Loa Marshall Stanmore III", price: 9800000, stock: 8, sold: 0, status: "PENDING", category: "Loa", image: productPlaceholder("Marshall") },
      { id: "P-4002", name: "Đàn guitar Taylor 314ce", price: 42000000, stock: 3, sold: 0, status: "PENDING", category: "Nhạc cụ", image: productPlaceholder("Guitar") },
    ],
  },
  {
    id: "SELLER-05",
    userId: "u-501",
    shopName: "QuickDeal 24h",
    ownerName: "Đỗ Văn Tài",
    email: "tai.do@gmail.com",
    phone: "0945678901",
    category: "Tổng hợp",
    businessType: "Cá nhân",
    cccdNumber: "079088006789",
    cccdVerified: true,
    taxCode: "—",
    address: "67 Trường Chinh, Quận Tân Bình, TP. Hồ Chí Minh",
    bankName: "MB Bank",
    accountNumber: "0909123456",
    accountHolder: "DO VAN TAI",
    status: "SUSPENDED",
    joinedAt: "18/04/2026",
    rating: 2.3,
    reviewCount: 89,
    totalOrders: 156,
    revenue: 210000000,
    suspendReason: "Bị báo cáo nhận tiền ngoài nền tảng rồi không giao hàng (RPT-770).",
    products: [],
  },
];

export const sellerStatusLabel = {
  APPROVED: "Đang hoạt động",
  PENDING: "Chờ duyệt",
  SUSPENDED: "Tạm khoá",
  REJECTED: "Đã từ chối",
};

// ── QUẢN LÝ NGƯỜI DÙNG ──
export const platformUsers = [
  { id: "u-101", fullName: "Nguyễn Văn An", email: "an.nguyen@gmail.com", phone: "0901234567", role: "SELLER", status: "ACTIVE", emailVerified: true, phoneVerified: true, joinedAt: "12/03/2026", orders: 863, lastActive: "Hôm nay" },
  { id: "u-201", fullName: "Trần Minh Thắng", email: "thang.tran@gmail.com", phone: "0912345678", role: "SELLER", status: "ACTIVE", emailVerified: true, phoneVerified: true, joinedAt: "05/01/2026", orders: 2140, lastActive: "Hôm nay" },
  { id: "u-601", fullName: "Phạm Thu Hà", email: "ha.pham@gmail.com", phone: "0956789012", role: "BUYER", status: "ACTIVE", emailVerified: true, phoneVerified: true, joinedAt: "28/05/2026", orders: 34, lastActive: "2 giờ trước" },
  { id: "u-602", fullName: "Hoàng Nam", email: "nam.hoang@gmail.com", phone: "0967890123", role: "BUYER", status: "ACTIVE", emailVerified: true, phoneVerified: false, joinedAt: "01/06/2026", orders: 12, lastActive: "Hôm qua" },
  { id: "u-501", fullName: "Đỗ Văn Tài", email: "tai.do@gmail.com", phone: "0945678901", role: "SELLER", status: "SUSPENDED", emailVerified: true, phoneVerified: true, joinedAt: "18/04/2026", orders: 156, lastActive: "5 ngày trước" },
  { id: "u-603", fullName: "Lan Anh", email: "lananh@gmail.com", phone: "0978901234", role: "BUYER", status: "ACTIVE", emailVerified: true, phoneVerified: true, joinedAt: "14/06/2026", orders: 7, lastActive: "3 giờ trước" },
  { id: "u-604", fullName: "Kim Ngân", email: "ngan.kim@gmail.com", phone: "0989012345", role: "BUYER", status: "ACTIVE", emailVerified: false, phoneVerified: false, joinedAt: "02/07/2026", orders: 1, lastActive: "Hôm nay" },
  { id: "u-701", fullName: "Vũ Thị Support", email: "support@auction.vn", phone: "0900000001", role: "SUPPORT_STAFF", status: "ACTIVE", emailVerified: true, phoneVerified: true, joinedAt: "01/01/2026", orders: 0, lastActive: "Đang online" },
  { id: "u-605", fullName: "Đức Anh", email: "ducanh@gmail.com", phone: "0990123456", role: "BUYER", status: "BANNED", emailVerified: true, phoneVerified: true, joinedAt: "20/05/2026", orders: 3, lastActive: "1 tuần trước", banReason: "Huỷ đơn liên tục, có dấu hiệu phá hoại" },
];

export const userRoleLabel = {
  BUYER: "Người mua",
  SELLER: "Người bán",
  SUPPORT_STAFF: "Nhân viên",
  ADMIN: "Quản trị",
};

export const userStatusLabel = {
  ACTIVE: "Hoạt động",
  SUSPENDED: "Tạm khoá",
  BANNED: "Cấm vĩnh viễn",
};

// ── NHẬT KÝ HOẠT ĐỘNG (audit log) ──
export const activityLog = [
  { id: "LOG-9001", staff: "Vũ Thị Support", action: "approve-seller", target: "Đơn seller 'An's Luxury Store'", detail: "Phê duyệt & xác minh CCCD", at: "11/07/2026 09:12", tone: "success" },
  { id: "LOG-9002", staff: "Vũ Thị Support", action: "reject-product", target: "SKU-4380 (Dao bấm tự động)", detail: "Từ chối — hàng cấm kinh doanh", at: "11/07/2026 08:45", tone: "danger" },
  { id: "LOG-9003", staff: "Trần Quản Lý", action: "suspend-seller", target: "Shop 'QuickDeal 24h'", detail: "Tạm khoá do báo cáo lừa đảo RPT-770", at: "10/07/2026 22:30", tone: "danger" },
  { id: "LOG-9004", staff: "Vũ Thị Support", action: "resolve-dispute", target: "DSP-440", detail: "Giải quyết — hoàn tiền một phần cho người mua", at: "10/07/2026 16:20", tone: "info" },
  { id: "LOG-9005", staff: "Trần Quản Lý", action: "approve-product", target: "P-2001 (iPhone 16 Pro Max)", detail: "Duyệt sản phẩm đăng bán", at: "10/07/2026 14:05", tone: "success" },
  { id: "LOG-9006", staff: "Vũ Thị Support", action: "warn-seller", target: "Shop 'Phụ Kiện Giá Rẻ'", detail: "Cảnh cáo — đánh giá ảo (RPT-766)", at: "10/07/2026 11:40", tone: "warning" },
  { id: "LOG-9007", staff: "Vũ Thị Support", action: "pause-auction", target: "AUC-8821 (Rolex Submariner)", detail: "Tạm dừng phiên — nghi ngờ hàng giả", at: "10/07/2026 09:15", tone: "warning" },
  { id: "LOG-9008", staff: "Trần Quản Lý", action: "ban-user", target: "Đức Anh (u-605)", detail: "Cấm tài khoản — phá hoại, huỷ đơn liên tục", at: "09/07/2026 18:50", tone: "danger" },
  { id: "LOG-9009", staff: "Vũ Thị Support", action: "verify-identity", target: "CCCD của Trần Thị Bình", detail: "Xác minh CCCD hợp lệ", at: "09/07/2026 15:30", tone: "success" },
  { id: "LOG-9010", staff: "Trần Quản Lý", action: "resolve-report", target: "RPT-769", detail: "Gỡ nội dung sản phẩm vi phạm", at: "09/07/2026 10:10", tone: "info" },
];

export const activityActionLabel = {
  "approve-seller": "Duyệt seller",
  "reject-product": "Từ chối SP",
  "approve-product": "Duyệt SP",
  "suspend-seller": "Khoá shop",
  "resolve-dispute": "Xử lý khiếu nại",
  "warn-seller": "Cảnh cáo",
  "pause-auction": "Dừng đấu giá",
  "ban-user": "Cấm user",
  "verify-identity": "Xác minh CCCD",
  "resolve-report": "Xử lý báo cáo",
};

// ── VAI TRÒ (chỉ xem) ──
export const platformRoles = [
  { id: "BUYER", name: "Người mua", description: "Mua hàng, tham gia đấu giá, quản lý ví cá nhân.", userCount: 48210, isSystem: true },
  { id: "SELLER", name: "Người bán", description: "Đăng sản phẩm, quản lý shop, tham gia đấu giá.", userCount: 342, isSystem: true },
  { id: "STAFF", name: "Staff", description: "Tra cứu dữ liệu, xem nhật ký hệ thống, giám sát vận hành (chỉ xem).", userCount: 8, isSystem: true },
  { id: "SUPPORT_STAFF", name: "Support Staff", description: "Hỗ trợ người dùng, xử lý khiếu nại, kiểm duyệt nội dung.", userCount: 12, isSystem: true },
  { id: "ADMIN", name: "Admin", description: "Quản trị toàn bộ nền tảng, cấu hình hệ thống.", userCount: 3, isSystem: true },
  { id: "SUPER_ADMIN", name: "Super Admin", description: "Toàn quyền, quản lý vai trò và cấu hình nhạy cảm.", userCount: 1, isSystem: true },
];

// ── VẬN CHUYỂN (chỉ xem) ──
export const staffShipments = [
  { id: "SHP-8801", orderId: "DH-28470", carrier: "GHN Express", trackingCode: "GHN88219001", from: "Q.7, TP.HCM", to: "Q.1, TP.HCM", status: "Đang giao", fee: 25000, estimatedDelivery: "13/07/2026", createdAt: "05/07/2026 10:30" },
  { id: "SHP-8800", orderId: "DH-28469", carrier: "GHTK", trackingCode: "GHTK77210045", from: "Long Biên, Hà Nội", to: "Cầu Giấy, Hà Nội", status: "Đã giao", fee: 20000, estimatedDelivery: "06/07/2026", createdAt: "04/07/2026 16:00" },
  { id: "SHP-8799", orderId: "DH-28467", carrier: "GHN Express", trackingCode: "GHN88218877", from: "Hải Châu, Đà Nẵng", to: "Ninh Kiều, Cần Thơ", status: "Đang lấy hàng", fee: 45000, estimatedDelivery: "15/07/2026", createdAt: "03/07/2026 09:15" },
  { id: "SHP-8798", orderId: "DGD-1201", carrier: "J&T Express", trackingCode: "JT99887766", from: "Hải Châu, Đà Nẵng", to: "Q.3, TP.HCM", status: "Đang giao", fee: 55000, estimatedDelivery: "14/07/2026", createdAt: "30/06/2026 21:00" },
];

export const shippingZones = [
  { id: "KV-01", name: "Nội thành TP.HCM", baseFee: 15000, days: "1-2 ngày" },
  { id: "KV-02", name: "Nội thành Hà Nội", baseFee: 15000, days: "1-2 ngày" },
  { id: "KV-03", name: "Liên tỉnh gần", baseFee: 30000, days: "2-4 ngày" },
  { id: "KV-04", name: "Liên tỉnh xa", baseFee: 45000, days: "4-7 ngày" },
];

// ── NHẬT KÝ SỰ KIỆN HỆ THỐNG (Event Log — khác nhật ký staff) ──
export const systemEventLogs = [
  { id: "EVT-10001", action: "USER.LOGIN", actor: "u-601", actorName: "Phạm Thu Hà", entityType: "User", entityId: "u-601", detail: "Đăng nhập thành công qua email", ip: "171.224.10.55", at: "12/07/2026 08:45:12", oldValue: null, newValue: "session_created" },
  { id: "EVT-10002", action: "ORDER.CREATED", actor: "u-601", actorName: "Phạm Thu Hà", entityType: "Order", entityId: "DH-28470", detail: "Tạo đơn hàng mới", ip: "171.224.10.55", at: "05/07/2026 09:00:03", oldValue: null, newValue: "status=PENDING" },
  { id: "EVT-10003", action: "AUCTION.BID_PLACED", actor: "u-101", actorName: "Nguyễn Văn An", entityType: "Auction", entityId: "DG-8821", detail: "Đặt giá 312.000.000đ", ip: "103.7.42.18", at: "05/07/2026 15:42:31", oldValue: "310.000.000đ", newValue: "312.000.000đ" },
  { id: "EVT-10004", action: "PAYMENT.COMPLETED", actor: "system", actorName: "Hệ thống", entityType: "Payment", entityId: "TT-90001", detail: "Thanh toán VNPay thành công", ip: "—", at: "05/07/2026 09:05:18", oldValue: "PENDING", newValue: "SUCCESS" },
  { id: "EVT-10005", action: "SELLER.APPROVED", actor: "u-701", actorName: "Vũ Thị Support", entityType: "Seller", entityId: "SELLER-01", detail: "Phê duyệt đơn đăng ký seller", ip: "103.7.42.100", at: "11/07/2026 09:12:00", oldValue: "PENDING", newValue: "APPROVED" },
  { id: "EVT-10006", action: "PRODUCT.REJECTED", actor: "u-701", actorName: "Vũ Thị Support", entityType: "Product", entityId: "P-4001", detail: "Từ chối sản phẩm — hàng cấm", ip: "103.7.42.100", at: "11/07/2026 08:45:22", oldValue: "PENDING", newValue: "REJECTED" },
  { id: "EVT-10007", action: "CONFIG.READ", actor: "u-701", actorName: "Vũ Thị Support", entityType: "System", entityId: "health", detail: "Xem trạng thái hệ thống", ip: "103.7.42.100", at: "12/07/2026 00:10:05", oldValue: null, newValue: null },
];

// ── SỨC KHỎE HỆ THỐNG ──
export const systemHealthStatus = {
  overall: "healthy",
  checkedAt: "12/07/2026 00:15:00",
  services: [
    { id: "api", name: "API Gateway", status: "up", latency: "42ms", uptime: "99.98%" },
    { id: "db", name: "PostgreSQL", status: "up", latency: "8ms", uptime: "99.99%" },
    { id: "redis", name: "Redis Cache", status: "up", latency: "2ms", uptime: "99.97%" },
    { id: "auction", name: "Auction Engine", status: "up", latency: "15ms", uptime: "99.95%" },
    { id: "payment", name: "Payment Service", status: "degraded", latency: "320ms", uptime: "99.80%", note: "VNPay callback chậm hơn bình thường" },
    { id: "notification", name: "Notification Service", status: "up", latency: "55ms", uptime: "99.96%" },
    { id: "storage", name: "Object Storage", status: "up", latency: "120ms", uptime: "99.99%" },
  ],
  metrics: {
    activeUsers: 1248,
    requestsPerMin: 3420,
    errorRate: "0.12%",
    avgResponse: "68ms",
  },
};
