export const sidebarMenuItems = [
  { id: "overview", label: "Tổng quan", icon: "grid", path: "/staff/overview" },
  { id: "seller-review", label: "Duyệt người bán", icon: "userCheck", path: "/staff/seller-review" },
  { id: "auctions", label: "Kiểm duyệt đấu giá", icon: "gavel", path: "/staff/auctions" },
  { id: "disputes", label: "Khiếu nại & tranh chấp", icon: "flag", path: "/staff/disputes" },
  { id: "orders", label: "Giám sát đơn hàng", icon: "cart", path: "/staff/orders" },
  { id: "reports", label: "Báo cáo vi phạm", icon: "shield", path: "/staff/reports" },
  { id: "notifications", label: "Thông báo", icon: "bell", path: "/staff/notifications" },
];

export const overviewStats = [
  { id: "pending-sellers", label: "Đơn đăng ký seller chờ duyệt", value: "12", hint: "Cần xử lý hôm nay", warn: true },
  { id: "flagged-auctions", label: "Phiên đấu giá bị báo cáo", value: "5", hint: "2 mức độ cao", warn: true },
  { id: "open-disputes", label: "Khiếu nại đang mở", value: "8", hint: "3 quá hạn SLA", warn: true },
  { id: "resolved-today", label: "Đã xử lý hôm nay", value: "24", hint: "+6 so với hôm qua", highlight: true },
  { id: "avg-response", label: "Thời gian phản hồi TB", value: "2.4h", hint: "Mục tiêu: < 4h" },
  { id: "active-auctions", label: "Phiên đấu giá đang diễn ra", value: "186", hint: "Toàn nền tảng" },
];

export const pendingTasks = [
  { id: "T-001", type: "seller", title: "Duyệt hồ sơ Nguyễn Văn An", priority: "high", due: "30 phút" },
  { id: "T-002", type: "auction", title: "Kiểm tra phiên Rolex Submariner #AUC-8821", priority: "high", due: "1 giờ" },
  { id: "T-003", type: "dispute", title: "Khiếu nại giao hàng chậm — ORD-2847", priority: "medium", due: "3 giờ" },
  { id: "T-004", type: "seller", title: "Duyệt hồ sơ Trần Thị Bình", priority: "medium", due: "Hôm nay" },
  { id: "T-005", type: "report", title: "Báo cáo hàng giả — SKU-4421", priority: "high", due: "2 giờ" },
];

export const sellerApplications = [
  {
    applicationId: "SA-1001",
    userId: "u-101",
    fullName: "Nguyễn Văn An",
    email: "an.nguyen@gmail.com",
    phone: "0901234567",
    shopName: "An's Luxury Store",
    category: "Đồng hồ & Trang sức",
    submittedAt: "01/07/2026 09:15",
    status: "PENDING",
    documents: ["CMND/CCCD", "Giấy phép KD", "Tài khoản ngân hàng"],
  },
  {
    applicationId: "SA-1002",
    userId: "u-102",
    fullName: "Trần Thị Bình",
    email: "binh.tran@gmail.com",
    phone: "0912345678",
    shopName: "Bình Tech Hub",
    category: "Điện tử",
    submittedAt: "01/07/2026 08:42",
    status: "PENDING",
    documents: ["CMND/CCCD", "Tài khoản ngân hàng"],
  },
  {
    applicationId: "SA-1003",
    userId: "u-103",
    fullName: "Lê Minh Cường",
    email: "cuong.le@gmail.com",
    phone: "0923456789",
    shopName: "Cường Collectibles",
    category: "Sưu tầm & Nghệ thuật",
    submittedAt: "30/06/2026 16:20",
    status: "PENDING",
    documents: ["CMND/CCCD", "Giấy phép KD"],
  },
];

export const flaggedAuctions = [
  {
    id: "AUC-8821",
    title: "Rolex Submariner Date — 2023",
    seller: "LuxuryTime VN",
    currentBid: "312.000.000đ",
    reports: 3,
    reason: "Nghi ngờ hàng không chính hãng",
    severity: "high",
    flaggedAt: "01/07/2026 07:30",
  },
  {
    id: "AUC-8815",
    title: "iPhone 16 Pro Max 256GB",
    seller: "TechZone",
    currentBid: "32.500.000đ",
    reports: 2,
    reason: "Mô tả không khớp hình ảnh",
    severity: "medium",
    flaggedAt: "30/06/2026 22:10",
  },
  {
    id: "AUC-8809",
    title: "Tranh sơn dầu cổ điển",
    seller: "ArtGallery HCM",
    currentBid: "45.000.000đ",
    reports: 1,
    reason: "Giá bất thường",
    severity: "low",
    flaggedAt: "30/06/2026 14:55",
  },
];

export const openDisputes = [
  {
    id: "DSP-441",
    orderId: "ORD-2847",
    buyer: "Phạm Thu Hà",
    seller: "TechZone",
    issue: "Giao hàng chậm 3 ngày so với cam kết",
    amount: "28.990.000đ",
    status: "Đang xử lý",
    openedAt: "30/06/2026 11:00",
    sla: "Quá hạn",
  },
  {
    id: "DSP-440",
    orderId: "ORD-2839",
    buyer: "Hoàng Nam",
    seller: "LuxuryTime VN",
    issue: "Sản phẩm khác mô tả — mặt số đồng hồ xước",
    amount: "285.000.000đ",
    status: "Chờ phản hồi seller",
    openedAt: "29/06/2026 15:30",
    sla: "Còn 4h",
  },
  {
    id: "DSP-439",
    orderId: "ORD-2831",
    buyer: "Lan Anh",
    seller: "ArtGallery HCM",
    issue: "Chưa nhận được hàng sau 7 ngày",
    amount: "18.500.000đ",
    status: "Mới",
    openedAt: "01/07/2026 08:00",
    sla: "Còn 20h",
  },
];

export const staffNotifications = [
  { type: "seller", title: "Đơn đăng ký seller mới", message: "Nguyễn Văn An vừa gửi hồ sơ", time: "5 phút", unread: true },
  { type: "auction", title: "Phiên đấu giá bị báo cáo", message: "AUC-8821 — nghi ngờ hàng giả", time: "20 phút", unread: true },
  { type: "dispute", title: "Khiếu nại quá hạn SLA", message: "DSP-441 cần xử lý gấp", time: "1 giờ", unread: true },
  { type: "order", title: "Đơn hàng bất thường", message: "ORD-2850 — giá trị cao bất thường", time: "2 giờ", unread: false },
];

export const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";
