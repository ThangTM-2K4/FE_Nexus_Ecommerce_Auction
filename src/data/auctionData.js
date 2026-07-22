const now = Date.now();
const HOUR = 3_600_000;
const DAY = 86_400_000;

/** @type {import('../types').AuctionListing[]} */
export const auctionListings = [
  {
    id: 'auc-1',
    title: 'Rolex Submariner Date 41mm',
    category: 'watches',
    categoryLabel: 'Đồng hồ',
    image: '/images/products/watches/rolex.jpg',
    description:
      'Rolex Submariner Date 41mm, tình trạng Like New, full box và giấy tờ xác thực đầy đủ.',
    currentBid: 325_500_000,
    endTime: now + 38 * 60_000,
    isLive: true,
    location: 'TP. Hồ Chí Minh',
    listingType: 'Đấu giá công khai',
    postedAt: now - 2 * DAY,
  },
  {
    id: 'auc-2',
    title: 'MacBook Pro M3 Max 16" 36GB/1TB',
    category: 'electronics',
    categoryLabel: 'Điện tử',
    image: '/images/products/electronics/macbook.jpg',
    description:
      'MacBook Pro 16 inch chip M3 Max, RAM 36GB, SSD 1TB, pin 98%, bảo hành Apple còn 8 tháng.',
    currentBid: 68_900_000,
    endTime: now + 5 * HOUR + 20 * 60_000,
    isLive: true,
    location: 'Hà Nội',
    listingType: 'Đấu giá công khai',
    postedAt: now - DAY,
  },
  {
    id: 'auc-3',
    title: 'Leica M11-P Safari Edition',
    category: 'collectibles',
    categoryLabel: 'Đồ sưu tầm',
    image: '/images/products/collectibles/leica.jpg',
    description:
      'Máy ảnh Leica M11-P phiên bản Safari giới hạn, full phụ kiện, shutter count thấp.',
    currentBid: 185_000_000,
    endTime: now + 3 * DAY + 4 * HOUR,
    isLive: true,
    location: 'Đà Nẵng',
    listingType: 'Đấu giá riêng tư',
    postedAt: now - 3 * DAY,
  },
  {
    id: 'auc-4',
    title: 'Tranh sơn dầu "Bình minh ven biển"',
    category: 'art',
    categoryLabel: 'Nghệ thuật',
    image: '/images/products/artworks/painting.jpg',
    description:
      'Tác phẩm sơn dầu canvas 80×120cm của họa sĩ đương đại, có chứng nhận nguồn gốc.',
    currentBid: 42_500_000,
    endTime: now + 2 * DAY + 11 * HOUR,
    isLive: true,
    location: 'TP. Hồ Chí Minh',
    listingType: 'Đấu giá công khai',
    postedAt: now - 4 * DAY,
  },
  {
    id: 'auc-5',
    title: 'Mercedes-Benz E300 AMG Line 2022',
    category: 'vehicles',
    categoryLabel: 'Xe cộ',
    image: '/images/categories/cat-car.jpg',
    description:
      'Mercedes E300 AMG Line, odo 18.000 km, nội thất da Nappa, một chủ từ đầu, full lịch sử bảo dưỡng.',
    currentBid: 1_285_000_000,
    endTime: now + 6 * DAY,
    isLive: true,
    location: 'Bình Dương',
    listingType: 'Đấu giá công khai',
    postedAt: now - 5 * DAY,
  },
  {
    id: 'auc-6',
    title: 'Bộ sofa da Ý Minotti 3 chỗ',
    category: 'furniture',
    categoryLabel: 'Nội thất',
    image: '/images/categories/cat-fashion.jpg',
    description:
      'Sofa da bò Ý chính hãng Minotti, thiết kế tối giản, phù hợp phòng khách hiện đại.',
    currentBid: 78_000_000,
    endTime: now + 4 * DAY + 6 * HOUR,
    isLive: false,
    location: 'Hà Nội',
    listingType: 'Mua ngay + đấu giá',
    postedAt: now - DAY,
  },
  {
    id: 'auc-7',
    title: 'Hermès Birkin 30 Togo Gold',
    category: 'fashion',
    categoryLabel: 'Thời trang',
    image: '/images/categories/cat-fashion.jpg',
    description:
      'Túi Hermès Birkin 30 da Togo màu Gold, phụ kiện đầy đủ, tình trạng xuất sắc.',
    currentBid: 412_000_000,
    endTime: now + 55 * 60_000,
    isLive: true,
    location: 'TP. Hồ Chí Minh',
    listingType: 'Đấu giá công khai',
    postedAt: now - 6 * HOUR,
  },
  {
    id: 'auc-8',
    title: 'Căn hộ penthouse Vinhomes Central Park',
    category: 'realestate',
    categoryLabel: 'Bất động sản',
    image: '/images/banners/hero.jpg',
    description:
      'Penthouse 280m², 4PN view sông Sài Gòn, nội thất cao cấp, sổ hồng riêng.',
    currentBid: 18_500_000_000,
    endTime: now + 9 * DAY,
    isLive: true,
    location: 'TP. Hồ Chí Minh',
    listingType: 'Đấu giá công khai',
    postedAt: now - 7 * DAY,
  },
  {
    id: 'auc-9',
    title: 'Porsche 911 Carrera S 2021',
    category: 'vehicles',
    categoryLabel: 'Xe cộ',
    image: '/images/categories/cat-car.jpg',
    description: 'Porsche 911 Carrera S 2021, odo 12.000km, nhập khẩu chính hãng. Đang chờ duyệt.',
    currentBid: 5_200_000_000,
    endTime: now + 15 * DAY,
    isLive: false,
    isUpcoming: true,
    location: 'TP. Hồ Chí Minh',
    listingType: 'Đấu giá công khai',
    postedAt: now - 1 * HOUR,
  },
  {
    id: 'auc-10',
    title: 'Đồng hồ Patek Philippe Aquanaut 5167A',
    category: 'watches',
    categoryLabel: 'Đồng hồ',
    image: '/images/products/watches/rolex.jpg',
    description: 'Đồng hồ Patek Philippe Aquanaut 5167A, hộp sổ đầy đủ. Chờ admin duyệt phiên.',
    currentBid: 1_250_000_000,
    endTime: now + 30 * DAY,
    isLive: false,
    isUpcoming: true,
    location: 'Hà Nội',
    listingType: 'Đấu giá công khai',
    postedAt: now - 2 * HOUR,
  },
];

export const auctionCategoryOptions = [
  { value: '', label: 'Tất cả danh mục' },
  { value: 'watches', label: 'Đồng hồ' },
  { value: 'electronics', label: 'Điện tử' },
  { value: 'collectibles', label: 'Đồ sưu tầm' },
  { value: 'art', label: 'Nghệ thuật' },
  { value: 'vehicles', label: 'Xe cộ' },
  { value: 'furniture', label: 'Nội thất' },
  { value: 'fashion', label: 'Thời trang' },
  { value: 'realestate', label: 'Bất động sản' },
];

export const auctionLocationOptions = [
  { value: '', label: 'Tất cả vị trí' },
  { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Bình Dương', label: 'Bình Dương' },
];

export const auctionListingTypeOptions = [
  { value: '', label: 'Tất cả loại tin' },
  { value: 'Đấu giá công khai', label: 'Đấu giá công khai' },
  { value: 'Đấu giá riêng tư', label: 'Đấu giá riêng tư' },
  { value: 'Mua ngay + đấu giá', label: 'Mua ngay + đấu giá' },
];

export const auctionTimeRangeOptions = [
  { value: '', label: 'Mọi thời gian' },
  { value: '24h', label: '24 giờ qua' },
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
];

export const auctionEndingWithinOptions = [
  { value: '', label: 'Bất kỳ' },
  { value: '1h', label: 'Trong 1 giờ' },
  { value: '24h', label: 'Trong 24 giờ' },
  { value: '3d', label: 'Trong 3 ngày' },
];

export const auctionPriceRangeOptions = [
  { value: '', label: 'Mọi mức giá' },
  { value: '0-50m', label: 'Dưới 50 triệu' },
  { value: '50m-500m', label: '50 – 500 triệu' },
  { value: '500m+', label: 'Trên 500 triệu' },
];

export const auctionSortOptions = [
  { value: 'ending-soon', label: 'Kết thúc sớm nhất' },
  { value: 'price-high', label: 'Giá cao nhất' },
  { value: 'newest', label: 'Mới đăng' },
];

export function countLiveAuctions(listings = auctionListings) {
  return listings.filter((item) => item.isLive && item.endTime > Date.now()).length;
}
