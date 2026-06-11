import { auctionImages as img } from "./images";

export const ongoingAuctions = [
  {
    id: 1,
    title: "Rolex Submariner Date 41mm",
    description: "Đồng hồ Rolex Submariner Date phiên bản 41mm, tình trạng Like New.",
    image: img.products.rolexSub,
    currentPrice: "325.500.000đ",
    timeLeft: "04:12:00",
    badge: { label: "SẮP KẾT THÚC", type: "danger" },
  },
  {
    id: 2,
    title: 'MacBook Pro M3 Max 16"',
    description: "MacBook Pro 16 inch chip M3 Max, RAM 36GB, SSD 1TB.",
    image: img.products.macbook,
    currentPrice: "68.900.000đ",
    timeLeft: "12:30:00",
    badge: { label: "MỚI", type: "success" },
  },
  {
    id: 3,
    title: "Leica M11-P Safari Edition",
    description: "Máy ảnh Leica M11-P phiên bản Safari, full box.",
    image: img.products.leica,
    currentPrice: "185.000.000đ",
    timeLeft: "1 ngày 05:10",
    badge: { label: "XU HƯỚNG", type: "primary" },
  },
  {
    id: 4,
    title: "Omega Speedmaster Professional",
    description: "Omega Speedmaster Moonwatch, bộ sưu tập cổ điển.",
    image: img.products.omega,
    currentPrice: "42.500.000đ",
    timeLeft: "08:45:00",
    badge: { label: "HOT", type: "danger" },
  },
  {
    id: 5,
    title: "iPhone 15 Pro Max 256GB",
    description: "iPhone 15 Pro Max Titan Tự Nhiên, mới 99%.",
    image: img.products.iphone,
    currentPrice: "28.900.000đ",
    timeLeft: "1 ngày 02:30",
    badge: { label: "MỚI", type: "success" },
  },
  {
    id: 6,
    title: "Pokémon Charizard 1st Edition",
    description: "Thẻ Pokémon Charizard hiếm, PSA 9.",
    image: img.products.pokemon,
    currentPrice: "15.200.000đ",
    timeLeft: "2 ngày 05:10",
    badge: { label: "XU HƯỚNG", type: "primary" },
  },
];

export const watchlistItems = [
  {
    id: 1,
    title: "Omega Speedmaster",
    status: "Đang dẫn đầu",
    price: "42.500.000đ",
    image: img.products.omega,
    statusType: "leading",
  },
  {
    id: 2,
    title: "iPhone 15 Pro Max",
    status: "Bị vượt giá",
    price: "28.900.000đ",
    image: img.products.iphone,
    statusType: "outbid",
  },
  {
    id: 3,
    title: "Pokémon Charizard",
    status: "Đang theo dõi",
    price: "15.200.000đ",
    image: img.products.pokemon,
    statusType: "watching",
  },
];

export const productCategories = [
  { id: "art", label: "Nghệ thuật", icon: "palette", image: img.categories.art },
  { id: "tech", label: "Công nghệ", icon: "cpu", image: img.categories.tech },
  { id: "fashion", label: "Thời trang", icon: "shirt", image: img.categories.fashion },
  { id: "car", label: "Ô tô", icon: "car", image: img.categories.car },
];

export const sidebarMenuItems = [
  { id: "bids", label: "My Bids", path: "/auction/my-bids", icon: "gavel" },
  { id: "auctions", label: "My Auctions", path: "/auction/seller", icon: "tag" },
  { id: "watchlist", label: "Watchlist", path: "/auction/browse", icon: "heart" },
  { id: "profile", label: "Hồ sơ & Uy tín", path: "/auction/profile", icon: "user" },
  { id: "settings", label: "Settings", path: "/auction/browse", icon: "settings" },
];

const auctionCatalog = {
  1: {
    id: 1,
    title: "Rolex Submariner Date 41mm",
    breadcrumbs: ["ĐỒNG HỒ", "ROLEX", "SUBMARINER"],
    seller: "LUXWATCH_HN",
    sellerAvatar: img.avatars.seller,
    sellerVerified: true,
    images: [img.products.rolexSub, img.products.omega, img.products.rolexDatejust],
    badge: "SẮP KẾT THÚC",
    description: "Rolex Submariner Date 41mm — tình trạng Like New, full box và giấy tờ.",
    specs: {
      brand: "Rolex",
      condition: "Like New 99%",
      movement: "Automatic 3235",
      year: "2023",
    },
    currentPrice: "325.500.000đ",
    leader: "minh_vip99",
    leaderAvatar: img.avatars.bidder1,
    timeLeft: "04:12:00",
    bidHistory: [
      { user: "minh_vip99", avatar: img.avatars.bidder1, amount: "325.500.000đ", time: "2 phút trước", isLeader: true },
      { user: "luxury_buyer", avatar: img.avatars.bidder2, amount: "325.000.000đ", time: "8 phút trước" },
      { user: "watch_fan", avatar: img.avatars.bidder3, amount: "324.500.000đ", time: "15 phút trước" },
    ],
  },
  101: {
    id: 101,
    title: "Patek Philippe Nautilus 5711/1A-010",
    breadcrumbs: ["ĐỒNG HỒ", "ĐỒ CỔ", "PATEK PHILIPPE NAUTILUS"],
    seller: "LUXWATCH_HN",
    sellerAvatar: img.avatars.seller,
    sellerVerified: true,
    images: [
      img.products.patek1,
      img.products.patek2,
      img.products.patek3,
      img.products.patek4,
      img.products.patek5,
    ],
    badge: "KẾT THÚC SỚM",
    description:
      "Patek Philippe Nautilus 5711/1A-010 — biểu tượng sang trọng và đẳng cấp. Nguyên seal, full box và giấy tờ chính hãng.",
    specs: {
      brand: "Patek Philippe",
      condition: "Likenew 98% (Có hộp/giấy)",
      movement: "Automatic 324 S C",
      year: "2021",
    },
    currentPrice: "$142,500",
    leader: "hieu_tran89",
    leaderAvatar: img.avatars.bidder4,
    timeLeft: "04:10:28",
    bidHistory: [
      { user: "hieu_tran89", avatar: img.avatars.bidder4, amount: "$142,500", time: "2 phút trước", isLeader: true },
      { user: "minh_vipa", avatar: img.avatars.bidder5, amount: "$142,000", time: "8 phút trước" },
      { user: "quan_luxury", avatar: img.avatars.bidder6, amount: "$141,500", time: "15 phút trước" },
    ],
  },
};

export const auctionDetail = auctionCatalog[101];

export const getAuctionDetail = (id) =>
  auctionCatalog[id] || auctionCatalog[101];

export const profileData = {
  name: "Nguyễn Minh Đức",
  avatar: img.avatars.main,
  badge: "Trusted Seller",
  bio: "Nhà sưu tập đồng hồ cổ và nghệ thuật. Chuyên giao dịch các sản phẩm cao cấp, uy tín và minh bạch.",
  location: "TP. Hồ Chí Minh, VN",
  verified: true,
  reputation: 4.9,
  totalReviews: 142,
  stats: [
    { label: "Tổng giao dịch", value: "218", trend: "+12%", trendType: "up" },
    { label: "Bán thành công", value: "86", sub: "Tỉ lệ 98%", subType: "info" },
    { label: "Thắng đấu giá", value: "132", sub: "Người mua tích cực", subType: "info" },
    { label: "Phản hồi tích cực", value: "100%", sub: "✓", subType: "success" },
  ],
  reviews: [
    {
      id: 1,
      name: "Lê Thu Thảo",
      role: "Đã đánh giá người bán",
      avatar: img.avatars.review1,
      rating: 5,
      time: "2 ngày trước",
      comment: "Giao dịch rất nhanh gọn, sản phẩm đúng mô tả. Rất hài lòng!",
      item: {
        name: "Omega Seamaster 1960s",
        price: "45,000,000 VND",
        image: img.products.omega,
      },
    },
    {
      id: 2,
      name: "Trần Văn Hùng",
      role: "Đã đánh giá người mua",
      avatar: img.avatars.review2,
      rating: 5,
      time: "5 ngày trước",
      comment: "Thanh toán đúng hạn, giao tiếp lịch sự. Sẽ hợp tác lại.",
      item: {
        name: "Tranh sơn dầu cổ",
        price: "120,000,000 VND",
        image: img.products.painting,
      },
    },
    {
      id: 3,
      name: "Phạm Minh Anh",
      role: "Đã đánh giá người bán",
      avatar: img.avatars.review3,
      rating: 5,
      time: "1 tuần trước",
      comment: "Đóng gói cẩn thận, giao hàng nhanh. Sản phẩm chất lượng tuyệt vời.",
      item: {
        name: "Rolex Datejust 36",
        price: "280,000,000 VND",
        image: img.products.rolexDatejust,
      },
    },
  ],
};

export const myBidsAuctions = [
  {
    id: 1,
    title: "Rolex Submariner Date 41mm",
    image: img.products.rolexSub,
    status: { label: "ĐANG DẪN ĐẦU", type: "leading" },
    timeLeft: "04:12:00",
    currentPrice: "325.500.000đ",
    bidIncrements: ["+500K", "+1M", "+2M"],
    bidHistory: [
      { user: "Bạn (Người dẫn đầu)", avatar: img.avatars.main, amount: "325.500.000đ", isYou: true, isLeader: true },
      { user: "minh_vip99", avatar: img.avatars.bidder1, amount: "325.000.000đ" },
      { user: "luxury_buyer", avatar: img.avatars.bidder2, amount: "324.500.000đ" },
    ],
    buttonStyle: "primary",
  },
  {
    id: 2,
    title: 'iPad Pro M2 12.9"',
    image: img.products.ipad,
    status: { label: "BỊ VƯỢT GIÁ", type: "outbid" },
    timeLeft: "00:45:00",
    currentPrice: "22.800.000đ",
    bidIncrements: ["+200K", "+500K", "+1M"],
    bidHistory: [
      { user: "tech_fan22", avatar: img.avatars.bidder3, amount: "22.800.000đ", isLeader: true },
      { user: "Bạn (Đã bị vượt)", avatar: img.avatars.main, amount: "22.500.000đ", isYou: true },
      { user: "apple_lover", avatar: img.avatars.bidder5, amount: "22.200.000đ" },
    ],
    buttonStyle: "dark",
  },
  {
    id: 3,
    title: "Pokémon Charizard 1st Ed.",
    image: img.products.pokemon,
    status: { label: "ĐANG QUAN TÂM", type: "watching" },
    timeLeft: "2 ngày 05:10",
    currentPrice: "15.200.000đ",
    bidIncrements: ["+100K", "+300K", "+500K"],
    bidHistory: [
      { user: "card_collector", avatar: img.avatars.bidder6, amount: "15.200.000đ", isLeader: true },
      { user: "poke_master", avatar: img.avatars.bidder4, amount: "15.000.000đ" },
      { user: "Bạn (Đang theo dõi)", avatar: img.avatars.main, amount: "—", isYou: true },
    ],
    buttonStyle: "primary",
  },
];

export const sellerStats = [
  {
    label: "TỔNG DOANH THU",
    value: "₫1.240.000.000",
    trend: "+12% so với tháng trước",
    trendType: "up",
    image: img.products.rolexSub,
  },
  {
    label: "ĐANG HOẠT ĐỘNG",
    value: "14",
    sub: "6 phiên kết thúc hôm nay",
    image: img.products.macbook,
  },
  {
    label: "GIÁ CAO NHẤT NHẬN ĐƯỢC",
    value: "₫45.000.000",
    sub: "Rolex Submariner Date",
    image: img.products.omega,
  },
];

export const sellerAuctions = [
  {
    id: 1,
    name: "Rolex Submariner Date",
    code: "#AUC-2847",
    image: img.products.rolexSub,
    status: { label: "Đang diễn ra", type: "active" },
    bids: 47,
    currentPrice: "₫32.500.000",
    timeLeft: "04:22:15",
  },
  {
    id: 2,
    name: "MacBook Pro M3 Max",
    code: "#AUC-2851",
    image: img.products.macbook,
    status: { label: "Mới tạo", type: "new" },
    bids: 3,
    currentPrice: "₫68.900.000",
    timeLeft: "2 ngày 12:00",
  },
  {
    id: 3,
    name: "Leica M11-P Safari",
    code: "#AUC-2839",
    image: img.products.leica,
    status: { label: "Kết thúc", type: "ended" },
    bids: 28,
    currentPrice: "₫185.000.000",
    timeLeft: "—",
  },
  {
    id: 4,
    name: "Omega Speedmaster",
    code: "#AUC-2844",
    image: img.products.omega,
    status: { label: "Đang diễn ra", type: "active" },
    bids: 35,
    currentPrice: "₫42.500.000",
    timeLeft: "08:15:30",
  },
];
