// Mock data tiếng Việt cho toàn bộ Admin Hub

export const mockCustomers = [
  { id: "KH-001", name: "Nguyễn Văn An", email: "an.nguyen@gmail.com", phone: "0901234567", address: "Quận 1, TP.HCM", status: "Hoạt động", createdAt: "12/01/2025", lastLogin: "05/07/2026 08:30", orders: 24, auctions: 8 },
  { id: "KH-002", name: "Trần Thị Bình", email: "binh.tran@gmail.com", phone: "0912345678", address: "Cầu Giấy, Hà Nội", status: "Hoạt động", createdAt: "03/02/2025", lastLogin: "04/07/2026 21:15", orders: 12, auctions: 3 },
  { id: "KH-003", name: "Lê Minh Cường", email: "cuong.le@gmail.com", phone: "0923456789", address: "Hải Châu, Đà Nẵng", status: "Đã khóa", createdAt: "20/03/2025", lastLogin: "28/06/2026 14:00", orders: 5, auctions: 15 },
  { id: "KH-004", name: "Phạm Thu Hà", email: "ha.pham@gmail.com", phone: "0934567890", address: "Ninh Kiều, Cần Thơ", status: "Hoạt động", createdAt: "15/04/2025", lastLogin: "05/07/2026 07:45", orders: 38, auctions: 0 },
  { id: "KH-005", name: "Hoàng Đức Nam", email: "nam.hoang@gmail.com", phone: "0945678901", address: "Thủ Đức, TP.HCM", status: "Hoạt động", createdAt: "08/05/2025", lastLogin: "03/07/2026 19:20", orders: 7, auctions: 22 },
];

export const mockSellers = [
  { id: "SL-001", name: "LuxuryTime VN", owner: "Võ Thanh Tùng", email: "tung@luxurytime.vn", phone: "0901111222", status: "Hoạt động", products: 156, revenue: "2.4 tỷ", rating: 4.8, auctionEnabled: true, createdAt: "10/01/2025" },
  { id: "SL-002", name: "TechHub Store", owner: "Đặng Minh Quân", email: "quan@techhub.vn", phone: "0902222333", status: "Chờ duyệt", products: 0, revenue: "0", rating: 0, auctionEnabled: false, createdAt: "04/07/2026" },
  { id: "SL-003", name: "Vintage Collect", owner: "Bùi Lan Anh", email: "anh@vintage.vn", phone: "0903333444", status: "Tạm khóa", products: 42, revenue: "890 triệu", rating: 4.2, auctionEnabled: true, createdAt: "22/02/2025" },
  { id: "SL-004", name: "Fashion Elite", owner: "Ngô Thị Mai", email: "mai@fashionelite.vn", phone: "0904444555", status: "Hoạt động", products: 312, revenue: "5.1 tỷ", rating: 4.9, auctionEnabled: false, createdAt: "05/11/2024" },
  { id: "SL-005", name: "Auto Parts Pro", owner: "Trịnh Văn Hùng", email: "hung@autoparts.vn", phone: "0905555666", status: "Chờ duyệt", products: 0, revenue: "0", rating: 0, auctionEnabled: false, createdAt: "03/07/2026" },
];

export const mockSellerVerifications = [
  { id: "KYC-001", seller: "TechHub Store", owner: "Đặng Minh Quân", cccd: "079201234567", businessLicense: "GP-2026-001234", bankAccount: "Vietcombank · ****6789", taxCode: "0312345678", status: "Chờ duyệt", submittedAt: "04/07/2026 09:15" },
  { id: "KYC-002", seller: "Auto Parts Pro", owner: "Trịnh Văn Hùng", cccd: "079198765432", businessLicense: "GP-2026-005678", bankAccount: "Techcombank · ****1234", taxCode: "0398765432", status: "Chờ duyệt", submittedAt: "03/07/2026 14:30" },
  { id: "KYC-003", seller: "Art Gallery VN", owner: "Lý Thị Hương", cccd: "079205551234", businessLicense: "GP-2025-009876", bankAccount: "BIDV · ****5678", taxCode: "0355566677", status: "Đã duyệt", submittedAt: "20/06/2026 11:00" },
  { id: "KYC-004", seller: "Sneaker World", owner: "Phan Đức Kiên", cccd: "079187654321", businessLicense: "—", bankAccount: "MB Bank · ****9012", taxCode: "—", status: "Từ chối", submittedAt: "15/06/2026 16:45" },
];

export const mockProducts = [
  { id: "SP-10001", name: "iPhone 16 Pro Max 256GB", seller: "TechHub Store", category: "Điện thoại", brand: "Apple", price: "32.990.000đ", quantity: 45, status: "Chờ duyệt", images: 5, createdAt: "04/07/2026" },
  { id: "SP-10002", name: "Rolex Submariner Date 2023", seller: "LuxuryTime VN", category: "Đồng hồ", brand: "Rolex", price: "285.000.000đ", quantity: 1, status: "Hoạt động", images: 8, createdAt: "01/07/2026" },
  { id: "SP-10003", name: "Samsung Galaxy S25 Ultra", seller: "TechHub Store", category: "Điện thoại", brand: "Samsung", price: "28.490.000đ", quantity: 30, status: "Hoạt động", images: 4, createdAt: "28/06/2026" },
  { id: "SP-10004", name: "Túi Louis Vuitton Neverfull", seller: "Fashion Elite", category: "Thời trang", brand: "Louis Vuitton", price: "42.000.000đ", quantity: 3, status: "Ẩn", images: 6, createdAt: "25/06/2026" },
  { id: "SP-10005", name: "MacBook Pro M4 14 inch", seller: "TechHub Store", category: "Laptop", brand: "Apple", price: "45.990.000đ", quantity: 12, status: "Chờ duyệt", images: 3, createdAt: "05/07/2026" },
  { id: "SP-10006", name: "Omega Speedmaster Moonwatch", seller: "LuxuryTime VN", category: "Đồng hồ", brand: "Omega", price: "98.000.000đ", quantity: 4, status: "Hoạt động", images: 6, createdAt: "03/07/2026" },
  { id: "SP-10007", name: "Giày Nike Dunk Low Panda", seller: "Sneaker World", category: "Thời trang", brand: "Nike", price: "3.890.000đ", quantity: 18, status: "Hoạt động", images: 4, createdAt: "02/07/2026" },
  { id: "SP-10008", name: "Tranh sơn dầu cổ — Thế kỷ XIX", seller: "Vintage Collect", category: "Sưu tầm", brand: "—", price: "125.000.000đ", quantity: 1, status: "Hoạt động", images: 7, createdAt: "30/06/2026" },
  { id: "SP-10009", name: "Áo khoác Burberry Classic", seller: "Fashion Elite", category: "Thời trang", brand: "Burberry", price: "18.500.000đ", quantity: 8, status: "Chờ duyệt", images: 5, createdAt: "05/07/2026" },
  { id: "SP-10010", name: "Sony PlayStation 5 Pro", seller: "TechHub Store", category: "Gaming", brand: "Sony", price: "16.990.000đ", quantity: 22, status: "Hoạt động", images: 3, createdAt: "01/07/2026" },
  { id: "SP-10011", name: "Air Jordan 1 Retro High OG", seller: "Sneaker World", category: "Thời trang", brand: "Nike", price: "5.200.000đ", quantity: 6, status: "Chờ duyệt", images: 4, createdAt: "04/07/2026" },
  { id: "SP-10012", name: "Đồng hồ Omega Vintage 1960s", seller: "Vintage Collect", category: "Đồng hồ", brand: "Omega", price: "45.000.000đ", quantity: 2, status: "Ẩn", images: 5, createdAt: "28/06/2026" },
];

export const mockSellerWarehouses = [
  { seller: "TechHub Store", owner: "Đặng Minh Quân", warehouseManager: "Nguyễn Thị Lan", phone: "0902222333", address: "Kho Q.7, TP.HCM" },
  { seller: "LuxuryTime VN", owner: "Võ Thanh Tùng", warehouseManager: "Trần Văn Phúc", phone: "0901111222", address: "Kho Q.1, TP.HCM" },
  { seller: "Fashion Elite", owner: "Phạm Thu Hà", warehouseManager: "Lê Thị Mai", phone: "0904444555", address: "Kho Long Biên, Hà Nội" },
  { seller: "Vintage Collect", owner: "Bùi Lan Anh", warehouseManager: "Hoàng Minh Đức", phone: "0903333444", address: "Kho Hải Châu, Đà Nẵng" },
  { seller: "Sneaker World", owner: "Phan Đức Kiên", warehouseManager: "Vũ Thanh Huy", phone: "0905555666", address: "Kho Thủ Đức, TP.HCM" },
];

export const mockAuctions = [
  { id: "DG-8821", title: "Rolex Submariner Date — 2023", seller: "LuxuryTime VN", startPrice: "250.000.000đ", currentPrice: "312.000.000đ", highestBid: "312.000.000đ", winner: "—", endTime: "05/07/2026 18:00", status: "Đang diễn ra", bids: 47 },
  { id: "DG-8815", title: "iPhone 16 Pro Max 256GB", seller: "TechHub Store", startPrice: "25.000.000đ", currentPrice: "28.500.000đ", highestBid: "28.500.000đ", winner: "—", endTime: "05/07/2026 16:30", status: "Sắp kết thúc", bids: 23 },
  { id: "DG-8802", title: "Tranh sơn dầu cổ — Thế kỷ XIX", seller: "Vintage Collect", startPrice: "80.000.000đ", currentPrice: "125.000.000đ", highestBid: "125.000.000đ", winner: "Lê Minh Cường", endTime: "30/06/2026 20:00", status: "Hoàn thành", bids: 31 },
  { id: "DG-8798", title: "Nike Air Jordan 1 Retro OG", seller: "Sneaker World", startPrice: "5.000.000đ", currentPrice: "8.200.000đ", highestBid: "8.200.000đ", winner: "—", endTime: "06/07/2026 12:00", status: "Đang diễn ra", bids: 15 },
  { id: "DG-8790", title: "Sony PlayStation 5 Pro", seller: "TechHub Store", startPrice: "12.000.000đ", currentPrice: "12.000.000đ", highestBid: "—", winner: "—", endTime: "04/07/2026 10:00", status: "Đã hủy", bids: 0 },
];

export const mockCategories = [
  { id: "DM-01", name: "Điện thoại", parent: "—", sortOrder: 1, status: "Hoạt động", productCount: 3240 },
  { id: "DM-02", name: "Laptop", parent: "—", sortOrder: 2, status: "Hoạt động", productCount: 1890 },
  { id: "DM-03", name: "Đồng hồ", parent: "—", sortOrder: 3, status: "Hoạt động", productCount: 856 },
  { id: "DM-04", name: "Smartphone", parent: "Điện thoại", sortOrder: 1, status: "Hoạt động", productCount: 2100 },
  { id: "DM-05", name: "Phụ kiện", parent: "Điện thoại", sortOrder: 2, status: "Tắt", productCount: 1140 },
  { id: "DM-06", name: "Thời trang", parent: "—", sortOrder: 4, status: "Hoạt động", productCount: 4520 },
];

export const mockBrands = [
  { id: "TH-01", name: "Apple", productCount: 1240, status: "Hoạt động", createdAt: "01/01/2024" },
  { id: "TH-02", name: "Samsung", productCount: 980, status: "Hoạt động", createdAt: "01/01/2024" },
  { id: "TH-03", name: "Sony", productCount: 456, status: "Hoạt động", createdAt: "15/03/2024" },
  { id: "TH-04", name: "Rolex", productCount: 89, status: "Hoạt động", createdAt: "20/06/2024" },
  { id: "TH-05", name: "Nike", productCount: 678, status: "Tắt", createdAt: "10/08/2024" },
];

export const mockOrders = [
  { id: "DH-28470", buyer: "Nguyễn Văn An", seller: "LuxuryTime VN", payment: "VNPay", shipping: "GHN Express", total: "32.990.000đ", status: "Đang xử lý", createdAt: "05/07/2026 09:00" },
  { id: "DH-28469", buyer: "Trần Thị Bình", seller: "Fashion Elite", payment: "Momo", shipping: "GHTK", total: "4.200.000đ", status: "Hoàn thành", createdAt: "04/07/2026 15:30" },
  { id: "DH-28468", buyer: "Lê Minh Cường", seller: "TechHub Store", payment: "COD", shipping: "Viettel Post", total: "28.490.000đ", status: "Đã hủy", createdAt: "04/07/2026 11:20" },
  { id: "DH-28467", buyer: "Phạm Thu Hà", seller: "Vintage Collect", payment: "VNPay", shipping: "GHN Express", total: "12.500.000đ", status: "Đang giao", createdAt: "03/07/2026 08:45" },
  { id: "DH-28466", buyer: "Hoàng Đức Nam", seller: "LuxuryTime VN", payment: "Banking", shipping: "J&T Express", total: "285.000.000đ", status: "Hoàn thành", createdAt: "02/07/2026 20:10" },
];

export const mockAuctionOrders = [
  { id: "DGD-1201", auction: "DG-8802", winner: "Lê Minh Cường", seller: "Vintage Collect", finalPrice: "125.000.000đ", paymentStatus: "Đã thanh toán", deliveryStatus: "Đang giao", createdAt: "30/06/2026 20:15" },
  { id: "DGD-1200", auction: "DG-8750", winner: "Nguyễn Văn An", seller: "LuxuryTime VN", finalPrice: "45.000.000đ", paymentStatus: "Đã thanh toán", deliveryStatus: "Đã giao", createdAt: "28/06/2026 18:00" },
  { id: "DGD-1199", auction: "DG-8745", winner: "Hoàng Đức Nam", seller: "TechHub Store", finalPrice: "15.800.000đ", paymentStatus: "Chờ thanh toán", deliveryStatus: "—", createdAt: "27/06/2026 14:30" },
];

export const mockBids = [
  { id: "BID-50001", auction: "DG-8821", bidder: "Nguyễn Văn An", amount: "312.000.000đ", bidTime: "05/07/2026 15:42", ip: "103.7.42.18", device: "Chrome / Windows", suspicious: false },
  { id: "BID-50002", auction: "DG-8821", bidder: "Hoàng Đức Nam", amount: "310.000.000đ", bidTime: "05/07/2026 15:38", ip: "103.7.42.18", device: "Safari / iOS", suspicious: true },
  { id: "BID-50003", auction: "DG-8815", bidder: "Trần Thị Bình", amount: "28.500.000đ", bidTime: "05/07/2026 14:20", ip: "171.224.10.55", device: "Chrome / Android", suspicious: false },
  { id: "BID-50004", auction: "DG-8815", bidder: "user_fake_99", amount: "28.200.000đ", bidTime: "05/07/2026 14:19", ip: "45.33.12.99", device: "Bot/Unknown", suspicious: true },
];

export const mockPayments = [
  { id: "TT-90001", transaction: "TXN-20260705001", buyer: "Nguyễn Văn An", seller: "LuxuryTime VN", amount: "32.990.000đ", fee: "1.649.500đ", method: "VNPay", status: "Thành công", createdAt: "05/07/2026 09:05" },
  { id: "TT-90002", transaction: "TXN-20260704002", buyer: "Trần Thị Bình", seller: "Fashion Elite", amount: "4.200.000đ", fee: "210.000đ", method: "Momo", status: "Thành công", createdAt: "04/07/2026 15:35" },
  { id: "TT-90003", transaction: "TXN-20260704003", buyer: "Lê Minh Cường", seller: "TechHub Store", amount: "28.490.000đ", fee: "0đ", method: "COD", status: "Đã hủy", createdAt: "04/07/2026 11:25" },
  { id: "TT-90004", transaction: "TXN-20260703004", buyer: "Phạm Thu Hà", seller: "Vintage Collect", amount: "12.500.000đ", fee: "625.000đ", method: "VNPay", status: "Chờ xử lý", createdAt: "03/07/2026 08:50" },
];

export const mockWallets = [
  { id: "VI-001", owner: "LuxuryTime VN", type: "Seller", balance: "450.000.000đ", frozen: "25.000.000đ", totalDeposit: "2.4 tỷ", totalWithdraw: "1.9 tỷ" },
  { id: "VI-002", owner: "Nguyễn Văn An", type: "Khách hàng", balance: "5.200.000đ", frozen: "0đ", totalDeposit: "50.000.000đ", totalWithdraw: "44.800.000đ" },
  { id: "VI-003", owner: "Fashion Elite", type: "Seller", balance: "890.000.000đ", frozen: "0đ", totalDeposit: "5.1 tỷ", totalWithdraw: "4.2 tỷ" },
  { id: "VI-004", owner: "TechHub Store", type: "Seller", balance: "120.000.000đ", frozen: "15.000.000đ", totalDeposit: "800.000.000đ", totalWithdraw: "665.000.000đ" },
];

export const mockWithdrawals = [
  { id: "RT-301", seller: "LuxuryTime VN", amount: "100.000.000đ", bank: "Vietcombank · ****6789", status: "Chờ duyệt", requestedAt: "05/07/2026 08:00" },
  { id: "RT-302", seller: "Fashion Elite", amount: "250.000.000đ", bank: "Techcombank · ****4321", status: "Chờ duyệt", requestedAt: "04/07/2026 16:30" },
  { id: "RT-303", seller: "Vintage Collect", amount: "50.000.000đ", bank: "BIDV · ****5678", status: "Đã duyệt", requestedAt: "03/07/2026 10:15" },
  { id: "RT-304", seller: "TechHub Store", amount: "30.000.000đ", bank: "MB Bank · ****9012", status: "Từ chối", requestedAt: "02/07/2026 14:00" },
];

export const mockCommissions = [
  { id: "PHI-01", name: "Phí Seller", type: "Phần trăm", value: "5%", description: "Hoa hồng trên mỗi đơn hàng" },
  { id: "PHI-02", name: "Phí đấu giá", type: "Phần trăm", value: "3%", description: "Hoa hồng khi đấu giá thành công" },
  { id: "PHI-03", name: "Phí rút tiền", type: "Cố định", value: "11.000đ", description: "Phí mỗi lần rút tiền" },
  { id: "PHI-04", name: "Phí thanh toán VNPay", type: "Phần trăm", value: "1.5%", description: "Phí cổng thanh toán" },
];

export const mockCoupons = [
  { id: "CP-001", code: "SUMMER2026", type: "Phần trăm", value: "15%", minOrder: "500.000đ", usageLimit: 1000, used: 342, startDate: "01/07/2026", endDate: "31/07/2026", status: "Hoạt động" },
  { id: "CP-002", code: "NEWUSER50K", type: "Cố định", value: "50.000đ", minOrder: "200.000đ", usageLimit: 5000, used: 1890, startDate: "01/01/2026", endDate: "31/12/2026", status: "Hoạt động" },
  { id: "CP-003", code: "AUCTION10", type: "Phần trăm", value: "10%", minOrder: "1.000.000đ", usageLimit: 200, used: 200, startDate: "01/06/2026", endDate: "30/06/2026", status: "Hết hạn" },
];

export const mockShippingPartners = [
  { id: "VC-01", name: "GHN Express", fee: "25.000đ", zones: "Toàn quốc", status: "Hoạt động" },
  { id: "VC-02", name: "GHTK", fee: "20.000đ", zones: "Miền Bắc, Miền Nam", status: "Hoạt động" },
  { id: "VC-03", name: "Viettel Post", fee: "22.000đ", zones: "Toàn quốc", status: "Hoạt động" },
  { id: "VC-04", name: "J&T Express", fee: "18.000đ", zones: "Miền Nam", status: "Tắt" },
];

export const mockShippingZones = [
  { id: "KV-01", name: "Nội thành TP.HCM", fee: "15.000đ", estimatedDays: "1-2 ngày" },
  { id: "KV-02", name: "Nội thành Hà Nội", fee: "15.000đ", estimatedDays: "1-2 ngày" },
  { id: "KV-03", name: "Liên tỉnh gần", fee: "30.000đ", estimatedDays: "2-4 ngày" },
  { id: "KV-04", name: "Liên tỉnh xa", fee: "45.000đ", estimatedDays: "4-7 ngày" },
];

export const mockReviews = [
  { id: "DG-001", product: "iPhone 16 Pro Max", buyer: "Nguyễn Văn An", seller: "TechHub Store", rating: 5, comment: "Sản phẩm chính hãng, giao hàng nhanh!", status: "Hiển thị", createdAt: "03/07/2026" },
  { id: "DG-002", product: "Túi Louis Vuitton", buyer: "user_spam_01", seller: "Fashion Elite", rating: 1, comment: "Hàng giả!!! Lừa đảo!!!", status: "Hiển thị", createdAt: "02/07/2026" },
  { id: "DG-003", product: "Rolex Submariner", buyer: "Lê Minh Cường", seller: "LuxuryTime VN", rating: 4, comment: "Đồng hồ đẹp, đóng gói cẩn thận.", status: "Ẩn", createdAt: "01/07/2026" },
];

export const mockReports = [
  { id: "BC-101", type: "Sản phẩm", target: "SP-10004 — Túi Louis Vuitton", reporter: "Nguyễn Văn An", reason: "Nghi ngờ hàng giả", severity: "Cao", status: "Đang mở", createdAt: "04/07/2026" },
  { id: "BC-102", type: "Seller", target: "Vintage Collect", reporter: "Trần Thị Bình", reason: "Giao hàng không đúng mô tả", severity: "Trung bình", status: "Đang mở", createdAt: "03/07/2026" },
  { id: "BC-103", type: "Đấu giá", target: "DG-8821 — Rolex Submariner", reporter: "Hoàng Đức Nam", reason: "Bid ảo, thao túng giá", severity: "Cao", status: "Đang xử lý", createdAt: "05/07/2026" },
  { id: "BC-104", type: "Người mua", target: "user_fake_99", reporter: "LuxuryTime VN", reason: "Không thanh toán sau đấu giá", severity: "Trung bình", status: "Đã xử lý", createdAt: "01/07/2026" },
];

export const mockNotifications = [
  { id: "TB-01", title: "Khuyến mãi hè 2026", type: "Khuyến mãi", audience: "Tất cả người dùng", sentAt: "01/07/2026 10:00", status: "Đã gửi" },
  { id: "TB-02", title: "Nhắc thanh toán đấu giá", type: "Nhắc đấu giá", audience: "Người thắng đấu giá", sentAt: "04/07/2026 08:00", status: "Đã gửi" },
  { id: "TB-03", title: "Bảo trì hệ thống 06/07", type: "Hệ thống", audience: "Tất cả", sentAt: "—", status: "Nháp" },
];

export const mockBanners = [
  { id: "BN-01", title: "Banner trang chủ — Hè 2026", type: "Trang chủ", position: "Slider chính", status: "Hoạt động", startDate: "01/07/2026", endDate: "31/07/2026" },
  { id: "BN-02", title: "Flash Sale điện thoại", type: "Khuyến mãi", position: "Banner giữa", status: "Hoạt động", startDate: "05/07/2026", endDate: "07/07/2026" },
  { id: "BN-03", title: "Sự kiện đấu giá Rolex", type: "Sự kiện", position: "Popup", status: "Tắt", startDate: "10/07/2026", endDate: "15/07/2026" },
];

export const mockContents = [
  { id: "ND-01", title: "Hướng dẫn đấu giá cho người mới", type: "Blog", status: "Xuất bản", updatedAt: "28/06/2026" },
  { id: "ND-02", title: "Làm sao để trở thành Seller?", type: "FAQ", status: "Xuất bản", updatedAt: "15/06/2026" },
  { id: "ND-03", title: "Điều khoản sử dụng", type: "Điều khoản", status: "Xuất bản", updatedAt: "01/01/2026" },
  { id: "ND-04", title: "Chính sách bảo mật", type: "Bảo mật", status: "Xuất bản", updatedAt: "01/01/2026" },
  { id: "ND-05", title: "Giới thiệu về Nexus", type: "Giới thiệu", status: "Nháp", updatedAt: "20/06/2026" },
];

export const mockFraudAlerts = [
  { id: "FD-01", type: "Bid giả", auction: "DG-8821", user: "user_fake_99", detail: "Cùng IP với tài khoản khác đang bid", severity: "Cao", detectedAt: "05/07/2026 15:40" },
  { id: "FD-02", type: "Bid quá nhanh", auction: "DG-8815", user: "bot_bidder", detail: "15 bid trong 30 giây", severity: "Cao", detectedAt: "05/07/2026 14:18" },
  { id: "FD-03", type: "Cùng IP", auction: "DG-8821", user: "Hoàng Đức Nam", detail: "IP trùng với Nguyễn Văn An", severity: "Trung bình", detectedAt: "05/07/2026 15:38" },
  { id: "FD-04", type: "Nhiều tài khoản", auction: "DG-8798", user: "cluster_abc", detail: "5 tài khoản cùng thiết bị", severity: "Cao", detectedAt: "04/07/2026 22:10" },
  { id: "FD-05", type: "Thao túng giá", auction: "DG-8821", user: "LuxuryTime VN", detail: "Seller tự bid sản phẩm của mình", severity: "Cao", detectedAt: "05/07/2026 12:00" },
];

export const mockAuditLogs = [
  { id: "LOG-001", actor: "Admin Nguyễn", action: "Duyệt Seller", target: "Art Gallery VN", time: "05/07/2026 10:30", ip: "103.7.42.100", oldValue: "Chờ duyệt", newValue: "Đã duyệt" },
  { id: "LOG-002", actor: "Admin Trần", action: "Ẩn sản phẩm", target: "SP-10004", time: "04/07/2026 16:00", ip: "171.224.10.200", oldValue: "Hoạt động", newValue: "Ẩn" },
  { id: "LOG-003", actor: "Super Admin", action: "Đổi phí Seller", target: "PHI-01", time: "03/07/2026 09:00", ip: "103.7.42.100", oldValue: "4%", newValue: "5%" },
  { id: "LOG-004", actor: "Finance Admin", action: "Duyệt rút tiền", target: "RT-303", time: "03/07/2026 11:00", ip: "45.33.12.50", oldValue: "Chờ duyệt", newValue: "Đã duyệt" },
];

export const mockSupportTickets = [
  { id: "HT-501", subject: "Không nhận được email xác nhận", user: "Nguyễn Văn An", assignee: "Support Lan", priority: "Trung bình", status: "Đang mở", createdAt: "05/07/2026 08:30", messages: 3 },
  { id: "HT-502", subject: "Hoàn tiền đơn DH-28468", user: "Lê Minh Cường", assignee: "Support Hùng", priority: "Cao", status: "Chờ xử lý", createdAt: "04/07/2026 14:00", messages: 5 },
  { id: "HT-503", subject: "Hướng dẫn đăng ký Seller", user: "Đặng Minh Quân", assignee: "—", priority: "Thấp", status: "Đang mở", createdAt: "04/07/2026 10:15", messages: 1 },
  { id: "HT-504", subject: "Lỗi thanh toán VNPay", user: "Phạm Thu Hà", assignee: "Support Lan", priority: "Cao", status: "Đã đóng", createdAt: "02/07/2026 16:45", messages: 8 },
];

export const mockInventory = [
  { id: "TK-001", seller: "TechHub Store", product: "iPhone 16 Pro Max 256GB", sku: "SP-10001", stock: 45, reserved: 5, threshold: 10, status: "Đủ hàng" },
  { id: "TK-002", seller: "LuxuryTime VN", product: "Rolex Submariner Date", sku: "SP-10002", stock: 1, reserved: 0, threshold: 1, status: "Sắp hết" },
  { id: "TK-003", seller: "Fashion Elite", product: "Túi Louis Vuitton Neverfull", sku: "SP-10004", stock: 0, reserved: 0, threshold: 2, status: "Hết hàng" },
  { id: "TK-004", seller: "TechHub Store", product: "MacBook Pro M4 14 inch", sku: "SP-10005", stock: 12, reserved: 3, threshold: 5, status: "Đủ hàng" },
  { id: "TK-005", seller: "Vintage Collect", product: "Đồng hồ Omega Vintage", sku: "SP-10012", stock: 2, reserved: 1, threshold: 3, status: "Sắp hết" },
  { id: "TK-006", seller: "TechHub Store", product: "Samsung Galaxy S25 Ultra", sku: "SP-10003", stock: 30, reserved: 4, threshold: 8, status: "Đủ hàng" },
  { id: "TK-007", seller: "TechHub Store", product: "Sony PlayStation 5 Pro", sku: "SP-10010", stock: 22, reserved: 2, threshold: 6, status: "Đủ hàng" },
  { id: "TK-008", seller: "LuxuryTime VN", product: "Omega Speedmaster Moonwatch", sku: "SP-10006", stock: 4, reserved: 1, threshold: 2, status: "Đủ hàng" },
  { id: "TK-009", seller: "Sneaker World", product: "Giày Nike Dunk Low Panda", sku: "SP-10007", stock: 18, reserved: 3, threshold: 5, status: "Đủ hàng" },
  { id: "TK-010", seller: "Sneaker World", product: "Air Jordan 1 Retro High OG", sku: "SP-10011", stock: 6, reserved: 0, threshold: 4, status: "Sắp hết" },
  { id: "TK-011", seller: "Fashion Elite", product: "Áo khoác Burberry Classic", sku: "SP-10009", stock: 8, reserved: 1, threshold: 3, status: "Đủ hàng" },
  { id: "TK-012", seller: "Vintage Collect", product: "Tranh sơn dầu cổ", sku: "SP-10008", stock: 1, reserved: 0, threshold: 1, status: "Sắp hết" },
];

export const mockAnalytics = {
  topSellers: [
    { name: "Fashion Elite", value: "5.1 tỷ" },
    { name: "LuxuryTime VN", value: "2.4 tỷ" },
    { name: "TechHub Store", value: "1.8 tỷ" },
    { name: "Vintage Collect", value: "890 triệu" },
  ],
  topBuyers: [
    { name: "Nguyễn Văn An", value: "450 triệu" },
    { name: "Phạm Thu Hà", value: "320 triệu" },
    { name: "Hoàng Đức Nam", value: "280 triệu" },
    { name: "Lê Minh Cường", value: "195 triệu" },
  ],
  topAuctions: [
    { name: "Rolex Submariner — DG-8821", value: "312 triệu" },
    { name: "Tranh sơn dầu — DG-8802", value: "125 triệu" },
    { name: "iPhone 16 Pro — DG-8815", value: "28.5 triệu" },
  ],
  topCategories: [
    { name: "Thời trang", value: "12.4 tỷ" },
    { name: "Điện thoại", value: "8.7 tỷ" },
    { name: "Đồng hồ", value: "6.2 tỷ" },
    { name: "Laptop", value: "4.1 tỷ" },
  ],
  topProducts: [
    { name: "Rolex Submariner Date", value: "285 triệu" },
    { name: "MacBook Pro M4", value: "46 triệu" },
    { name: "iPhone 16 Pro Max", value: "33 triệu" },
  ],
  topSearches: [
    { name: "iphone 16", value: "12.400 lượt" },
    { name: "rolex", value: "8.200 lượt" },
    { name: "louis vuitton", value: "5.600 lượt" },
    { name: "macbook", value: "4.800 lượt" },
  ],
  conversion: "3.2%",
  cancellationRate: "1.8%",
};

export const mockSystemSettings = {
  website: { name: "Nexus Auction", email: "admin@nexus.vn", logo: "logo.png" },
  auction: { minIncrement: "100.000đ", maxDuration: "7 ngày", autoExtension: "5 phút", reservePrice: true },
  order: { cancelTime: "30 phút", returnTime: "7 ngày" },
  payment: { gateway: "VNPay", fee: "1.5%" },
};

export const mockRolePermissions = [
  { module: "Dashboard", superAdmin: true, admin: true, moderator: true, finance: true, support: true },
  { module: "Quản lý người dùng", superAdmin: true, admin: true, moderator: true, finance: false, support: true },
  { module: "Xác minh Seller", superAdmin: true, admin: true, moderator: false, finance: false, support: false },
  { module: "Quản lý sản phẩm", superAdmin: true, admin: true, moderator: true, finance: false, support: false },
  { module: "Quản lý đấu giá", superAdmin: true, admin: true, moderator: true, finance: false, support: false },
  { module: "Quản lý Bid", superAdmin: true, admin: true, moderator: true, finance: false, support: false },
  { module: "Quản lý đơn hàng", superAdmin: true, admin: true, moderator: true, finance: true, support: true },
  { module: "Quản lý thanh toán", superAdmin: true, admin: true, moderator: false, finance: true, support: false },
  { module: "Quản lý rút tiền", superAdmin: true, admin: true, moderator: false, finance: true, support: false },
  { module: "Cài đặt hoa hồng", superAdmin: true, admin: true, moderator: false, finance: true, support: false },
  { module: "Báo cáo & Khiếu nại", superAdmin: true, admin: true, moderator: true, finance: false, support: true },
  { module: "Cài đặt hệ thống", superAdmin: true, admin: false, moderator: false, finance: false, support: false },
  { module: "Vai trò & Quyền", superAdmin: true, admin: false, moderator: false, finance: false, support: false },
  { module: "Nhật ký hệ thống", superAdmin: true, admin: true, moderator: false, finance: true, support: false },
];

export const STATUS_OPTIONS = {
  general: [
    { value: "Hoạt động", label: "Hoạt động" },
    { value: "Chờ duyệt", label: "Chờ duyệt" },
    { value: "Đã khóa", label: "Đã khóa" },
    { value: "Tạm khóa", label: "Tạm khóa" },
    { value: "Tắt", label: "Tắt" },
    { value: "Ẩn", label: "Ẩn" },
  ],
  order: [
    { value: "Đang xử lý", label: "Đang xử lý" },
    { value: "Đang giao", label: "Đang giao" },
    { value: "Hoàn thành", label: "Hoàn thành" },
    { value: "Đã hủy", label: "Đã hủy" },
  ],
};
