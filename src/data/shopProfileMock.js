import { mockProducts } from './mockProducts';

export const SHOP_ID = 'shop-1';

export const shopCategories = [
  { id: 'cat-wireless-mouse', label: 'Chuột Không Dây' },
  { id: 'cat-wired-mouse', label: 'Chuột Gaming Có Dây' },
  { id: 'cat-keyboard', label: 'Bàn Phím Gaming' },
  { id: 'cat-headset', label: 'Tai Nghe Chụp Tai' },
  { id: 'cat-mousepad', label: 'Lót Chuột' },
  { id: 'cat-webcam', label: 'Webcam' },
  { id: 'cat-speaker', label: 'Loa Máy Tính' },
  { id: 'cat-accessory', label: 'Phụ Kiện Gaming' },
];

const CATEGORY_IDS = shopCategories.map((c) => c.id);

const baseProducts = mockProducts.map((p, i) => ({
  ...p,
  shopId: SHOP_ID,
  categoryId: CATEGORY_IDS[i % CATEGORY_IDS.length],
  rating: Number((3.8 + (i % 12) * 0.1).toFixed(1)),
  soldNumeric: 1000 + i * 137,
  monthlySold: `${(120 + (i % 9) * 45).toLocaleString('vi-VN')}/tháng`,
  popularity: 100 - (i % 40),
  createdAt: Date.now() - i * 86400000 * 3,
  isSuggested: i < 12,
  isBestSeller: i < 6,
  tags: i % 3 === 0 ? [...(p.tags || []), 'Mua Kèm Deal Sốc'] : p.tags,
}));

/** Thêm sản phẩm để grid đủ nhiều trang */
const extraShopProducts = Array.from({ length: 24 }, (_, i) => {
  const idx = mockProducts.length + i;
  const base = mockProducts[i % mockProducts.length];
  return {
    ...base,
    id: `p-shop-${idx + 1}`,
    title: `${base.title} — Shop #${idx + 1}`,
    shopId: SHOP_ID,
    categoryId: CATEGORY_IDS[idx % CATEGORY_IDS.length],
    rating: Number((4 + (i % 8) * 0.1).toFixed(1)),
    soldNumeric: 800 + idx * 91,
    monthlySold: `${(80 + (i % 7) * 30).toLocaleString('vi-VN')}/tháng`,
    popularity: 90 - (i % 30),
    createdAt: Date.now() - idx * 86400000 * 2,
    isSuggested: false,
    isBestSeller: false,
    tags: i % 4 === 0 ? ['Mall', 'Mua Kèm Deal Sốc'] : base.tags,
  };
});

export function getApprovedSellerProducts() {
  try {
    const raw = localStorage.getItem("seller_created_products") || "[]";
    const list = JSON.parse(raw);
    return list
      .filter((p) => {
        const mod = String(p.moderationStatus || "").toUpperCase();
        const st = String(p.status || "").toUpperCase();
        return mod === "APPROVED" || st === "APPROVED" || st === "ACTIVE" || st === "PUBLISHED";
      })
      .map((p, i) => {
        const imgSrc =
          (typeof p.images?.[0] === "string" ? p.images[0] : p.images?.[0]?.url) ||
          (typeof p.image === "string" ? p.image : p.image?.url) ||
          p.imageUrl ||
          "/images/products/electronics/iphone.jpg";
        return {
          id: p.id || `p-approved-${i}`,
          title: p.name || p.title || "Sản phẩm",
          name: p.name || p.title || "Sản phẩm",
          price: Number(p.price || 0),
          stock: Number(p.stockQuantity ?? p.stock ?? 0),
          stockQuantity: Number(p.stockQuantity ?? p.stock ?? 0),
          image: imgSrc,
          images: p.images || [imgSrc],
          rating: 5.0,
          soldNumeric: 0,
          monthlySold: "Mới đăng",
          shopId: SHOP_ID,
          categoryId: p.category || CATEGORY_IDS[0],
          createdAt: Date.now(),
          isSuggested: true,
          isBestSeller: true,
          tags: ["Hàng Mới"],
        };
      });
  } catch {
    return [];
  }
}

export function getAllShopProducts() {
  const approved = getApprovedSellerProducts();
  return [...approved, ...baseProducts, ...extraShopProducts];
}

export const shopProducts = getAllShopProducts();

export const shopProfile = {
  id: SHOP_ID,
  name: 'Pate Shop',
  avatar: '/images/products/collectibles/leica.jpg',

  isOnline: true,
  lastOnline: '5 phút trước',
  isMall: true,
  badge: 'Shopee Mall',
  addressMasked: '***** Quận 7, TP. Hồ Chí Minh',
  companyMasked: 'CÔNG TY TNHH ***** TECH',
  stats: {
    products: '256',
    following: '128',
    chatResponseRate: '98%',
    followers: '12,4k',
    rating: '4.8',
    reviewCount: '15,2k',
    joined: '3 năm trước',
    address: '***** Quận 7, TP. Hồ Chí Minh',
    company: 'CÔNG TY TNHH ***** TECH',
  },
};

export function getShopById(shopId) {
  if (shopId !== SHOP_ID) return null;
  return shopProfile;
}

export function getShopCategories() {
  return shopCategories;
}

export function getSuggestedProducts(shopId, limit = 6, productsSource = null) {
  const source = productsSource || getAllShopProducts();
  return source.filter((p) => p.shopId === shopId && p.isSuggested).slice(0, limit);
}

export function getBestSellerProducts(shopId, limit = 6, productsSource = null) {
  const source = productsSource || getAllShopProducts();
  return source
    .filter((p) => p.shopId === shopId && p.isBestSeller)
    .sort((a, b) => b.soldNumeric - a.soldNumeric)
    .slice(0, limit);
}

const PRICE_RANGES = {
  'under-200k': { min: 0, max: 200000 },
  '200k-500k': { min: 200000, max: 500000 },
  '500k-1m': { min: 500000, max: 1000000 },
  'over-1m': { min: 1000000, max: Infinity },
};

export function filterShopProducts(
  products,
  { shopId = SHOP_ID, categoryId = null, sortBy = 'popular', priceFilter = 'all' } = {},
) {
  const source = Array.isArray(products) && products.length > 0 ? products : getAllShopProducts();
  const normalizedShopId = shopId || SHOP_ID;
  let list = source.filter(
    (p) => String(p.shopId || '').toLowerCase() === String(normalizedShopId).toLowerCase(),
  );

  if (categoryId) {
    list = list.filter((p) => p.categoryId === categoryId);
  }

  if (priceFilter && priceFilter !== 'all' && PRICE_RANGES[priceFilter]) {
    const { min, max } = PRICE_RANGES[priceFilter];
    list = list.filter((p) => p.price >= min && p.price < max);
  }

  if (priceFilter === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (priceFilter === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'newest') {
    list.sort((a, b) => b.createdAt - a.createdAt);
  } else if (sortBy === 'bestselling') {
    list.sort((a, b) => b.soldNumeric - a.soldNumeric);
  } else {
    list.sort((a, b) => b.popularity - a.popularity);
  }

  return list;
}

export function paginateProducts(products, page = 1, pageSize = 15) {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: products.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
    pageSize,
  };
}
