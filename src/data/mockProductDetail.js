import { mockProducts } from './mockProducts';

const GALLERY_IMAGES = [
  '/images/products/electronics/iphone.jpg',
  '/images/products/electronics/macbook.jpg',
  '/images/products/electronics/ipad.jpg',
  '/images/products/watches/rolex.jpg',
  '/images/products/watches/rolex-datejust.jpg',
  '/images/products/watches/omega.jpg',
  '/images/products/watches/patek-1.jpg',
  '/images/products/watches/patek-2.jpg',
  '/images/products/collectibles/leica.jpg',
];

const DEFAULT_DETAIL = {
  badge: 'Yêu thích+',
  title: 'Tai nghe Bluetooth chống ồn chủ động Pro Max',
  rating: 4.7,
  reviewCount: 1284,
  soldCount: '150k+',
  priceMin: 42000,
  priceMax: 65660,
  originalPrice: 89000,
  discountPercent: 36,
  shipping: 'Miễn phí',
  shippingNote: 'Nhận hàng từ 2-4 ngày',
  inStock: true,
  stock: 842,
  likeCount: 2341,
  category: [
    { label: 'Shopee', href: '/' },
    { label: 'Điện Thoại & Phụ Kiện', href: '#' },
    { label: 'Phụ Kiện', href: '#' },
    { label: 'Tai Nghe', href: '#' },
  ],
  policies: [
    { icon: '↩', text: 'Trả hàng miễn phí 15 ngày' },
    { icon: '🛡', text: 'Bảo hiểm Shopee' },
    { icon: '✓', text: 'Hàng chính hãng 100%' },
  ],
  variants: [
    { id: 'v1', name: 'Đen', image: '/images/products/electronics/iphone.jpg', price: 42000 },
    { id: 'v2', name: 'Trắng', image: '/images/products/electronics/macbook.jpg', price: 45000 },
    { id: 'v3', name: 'Hồng', image: '/images/products/electronics/ipad.jpg', price: 48000 },
    { id: 'v4', name: 'Xanh Navy', image: '/images/products/watches/rolex.jpg', price: 65660 },
  ],
  attributes: {
    category: 'Điện Thoại & Phụ Kiện > Phụ Kiện > Tai Nghe',
    stock: '842',
    warranty: '12 tháng',
    origin: 'Việt Nam',
    shipFrom: 'TP. Hồ Chí Minh',
  },
  description: `Tai nghe Bluetooth chống ồn chủ động với thiết kế ergonomic, đeo thoải mái cả ngày dài.

• Chống ồn chủ động ANC giảm tiếng ồn môi trường hiệu quả
• Pin 30 giờ, sạc nhanh USB-C
• Bluetooth 5.3, kết nối ổn định 2 thiết bị
• Micro tích hợp chống ồn cho cuộc gọi rõ ràng

Sản phẩm phù hợp đi làm, tập gym, đi du lịch. Bảo hành chính hãng 12 tháng.`,
  gallery: GALLERY_IMAGES.map((src, i) => ({
    id: `g-${i + 1}`,
    src,
    alt: `Ảnh sản phẩm ${i + 1}`,
    isVideo: i === 0,
  })),
  shop: {
    id: 'shop-1',
    name: 'Pate Shop',
    avatar: '/images/products/collectibles/leica.jpg',

    isOnline: true,
    lastOnline: '5 phút trước',
    badge: 'Yêu thích+',
    stats: [
      { label: 'Đánh Giá', value: '4.8/5' },
      { label: 'Tỉ Lệ Phản Hồi', value: '98%' },
      { label: 'Tham Gia', value: '3 năm trước' },
      { label: 'Sản Phẩm', value: '256' },
      { label: 'Thời Gian Phản Hồi', value: 'trong vài giờ' },
      { label: 'Người Theo Dõi', value: '12,4k' },
    ],
  },
};

/** Chi tiết SP theo id — fallback về mock mặc định nếu không tìm thấy */
export function getProductDetail(id) {
  const base = mockProducts.find((p) => p.id === id);

  if (!base) {
    return {
      ...DEFAULT_DETAIL,
      id: id || 'p-1',
      title: DEFAULT_DETAIL.title,
      category: [
        ...DEFAULT_DETAIL.category.slice(0, 3),
        { label: DEFAULT_DETAIL.title, href: null },
      ],
    };
  }

  const price = base.price;
  const discount = base.discountPercent || 0;
  const originalPrice = discount
    ? Math.round(price / (1 - discount / 100))
    : price * 1.2;

  return {
    ...DEFAULT_DETAIL,
    id: base.id,
    badge: base.tags.find((t) => t === 'Yêu thích+') || base.tags[0] || null,
    title: base.title,
    priceMin: price,
    priceMax: price + Math.round(price * 0.15),
    originalPrice,
    discountPercent: discount,
    soldCount: base.soldCount,
    category: [
      { label: 'Shopee', href: '/' },
      { label: 'Danh Mục', href: '#' },
      { label: 'Sản Phẩm', href: '#' },
      { label: base.title, href: null },
    ],
    gallery: [
      { id: 'g-main', src: base.image, alt: base.title, isVideo: false },
      ...DEFAULT_DETAIL.gallery.slice(1),
    ],
    variants: DEFAULT_DETAIL.variants.map((v, i) => ({
      ...v,
      price: price + i * 3000,
      image: i === 0 ? base.image : v.image,
    })),
  };
}

/** Sản phẩm cùng shop (mock) */
export function getShopProducts(excludeId, count = 48) {
  return mockProducts.filter((p) => p.id !== excludeId).slice(0, count);
}

/** Sản phẩm tương tự (mock) */
export function getSimilarProducts(excludeId, count = 48) {
  return mockProducts
    .filter((p) => p.id !== excludeId)
    .slice(5)
    .concat(mockProducts.slice(0, 5))
    .slice(0, count);
}
