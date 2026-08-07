import api from '../config/api';
import { unwrapData, getApiErrorMessage } from '../utils/apiResponse';
import { getCategories as fetchCategories } from './categoryService';
import { getProducts, getProductById, resolveImageUrl } from './ecommerceProductService';

export { getApiErrorMessage, getProducts, getProductById };

let sellerBusinessNameCache = null;

const SQL_SERVER_SELLERS_MAP = {
  '4bd76d55-6ab4-4883-b7d3-5a405bed06fb': 'Nam Shop',
  '4f8c6758-faf6-477c-a1c3-23eeacb7df40': 'NY Shop',
  'cc4a286a-690f-410f-9d8f-8608e7e56aeb': 'Tuấn Shop',
  '6eb484ce-9dec-4de0-b9fe-fdf300d2b176': 'Louis Trần Chuyên Phụ Kiện',
  'b884f65e-0222-4eed-b587-0473ad57c523': 'Katsu Chuyên Đồ Nữ',
  'fe16eec5-ee1a-40b0-99f3-0523e526a8cc': 'TV Shop',
  'bc42abb4-502f-4648-b9ac-e9938291a05b': 'Bảo bán áo',
  'e40f71e5-edce-4fe9-aabf-2b55234362e1': 'VU QUAN BAN AO',
  'f2efc4fd-365e-412e-a1b6-17cb3222ef3d': 'Shop Đồ Gia Dụng',
  '5c33dfb-c0a2-4296-96aa-2507fcafb698': 'Thùy Dung Shop',
  'ed8707cc-4064-4509-886f-0abb037083fd': 'Ngọc Hân Store',
  'e370b989-af18-41e8-bc80-bce7a7610d00': 'Đạt Châu Shop',
  '7f5f59d8-dd92-4398-86bf-b71cee783dde': 'Pate Shop',
};

/** Truy vấn Tên Shop (BusinessName) chính thức từ CSDL SQL Server qua GET /api/v1/sellers/search */
export async function getSellerBusinessName(sellerUserId) {
  if (!sellerUserId) return null;
  const targetId = String(sellerUserId).toLowerCase().trim();

  if (SQL_SERVER_SELLERS_MAP[targetId]) {
    return SQL_SERVER_SELLERS_MAP[targetId];
  }

  if (sellerBusinessNameCache && sellerBusinessNameCache[targetId]) {
    return sellerBusinessNameCache[targetId];
  }

  try {
    const keywords = ['Shop', 'a', 'e', 'o', 'i', 'u'];
    sellerBusinessNameCache = sellerBusinessNameCache || { ...SQL_SERVER_SELLERS_MAP };

    await Promise.all(
      keywords.map((kw) =>
        api
          .get('/sellers/search', {
            params: { keyword: kw, page: 1, pageSize: 100 },
            skipErrorRedirect: true,
          })
          .then((res) => {
            const payload = unwrapData(res.data) || res.data?.data || res.data;
            const items = payload?.items || (Array.isArray(payload) ? payload : []);
            items.forEach((s) => {
              const uId = String(s.userId || s.UserId || '').toLowerCase().trim();
              const sId = String(s.sellerId || s.SellerId || '').toLowerCase().trim();
              const bName = s.businessName || s.BusinessName || s.shopName || s.ShopName;
              if (bName) {
                if (uId) sellerBusinessNameCache[uId] = bName;
                if (sId) sellerBusinessNameCache[sId] = bName;
              }
            });
          })
          .catch(() => {}),
      ),
    );

    return sellerBusinessNameCache[targetId] || null;
  } catch {
    return SQL_SERVER_SELLERS_MAP[targetId] || null;
  }
}

const DEFAULT_SHOP_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80';

/** Tìm bản ghi seller từ API theo userId / sellerId (GUID). */
export async function findSellerRecordById(sellerOrUserId) {
  const target = String(sellerOrUserId || '').trim().toLowerCase();
  if (!target) return null;

  const directPaths = [
    `/sellers/${sellerOrUserId}`,
    `/sellers/user/${sellerOrUserId}`,
    `/sellers/public/${sellerOrUserId}`,
  ];

  for (const path of directPaths) {
    try {
      const { data } = await api.get(path, { skipErrorRedirect: true });
      const seller = unwrapData(data);
      if (seller && typeof seller === 'object') return seller;
    } catch {
      /* thử path tiếp theo */
    }
  }

  const keywords = ['Shop', 'a', 'e', 'o', 'u'];
  for (const kw of keywords) {
    try {
      const { data } = await api.get('/sellers/search', {
        params: { keyword: kw, page: 1, pageSize: 100 },
        skipErrorRedirect: true,
      });
      const payload = unwrapData(data) || data;
      const items = payload?.items || (Array.isArray(payload) ? payload : []);
      const matched = items.find((s) => {
        const uId = String(s.userId || s.UserId || '').toLowerCase().trim();
        const sId = String(s.sellerId || s.SellerId || s.id || '').toLowerCase().trim();
        return uId === target || sId === target;
      });
      if (matched) return matched;
    } catch {
      /* keyword tiếp theo */
    }
  }

  return null;
}

/** Avatar shop: ưu tiên API → logo seller đã lưu local → mặc định. */
export function resolveSellerAvatar(seller, userId) {
  const fromApi =
    seller?.avatarUrl ||
    seller?.logoUrl ||
    seller?.shopAvatarUrl ||
    seller?.profileImageUrl ||
    seller?.avatar ||
    seller?.logo;

  if (fromApi) {
    const resolved = resolveImageUrl(fromApi);
    return resolved || fromApi;
  }

  if (userId) {
    try {
      const raw = localStorage.getItem(`mockSellerShopProfile_${userId}`);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.logo) return saved.logo;
        if (saved?.avatar) return saved.avatar;
      }
    } catch {
      /* ignore */
    }
  }

  return DEFAULT_SHOP_AVATAR;
}

/** Hồ sơ shop công khai cho /shop/:shopId — mock shop-1 hoặc seller thật từ API. */
export async function resolvePublicShopProfile(shopId, mockShopResolver) {
  const normalizedId = String(shopId || '').trim();
  if (!normalizedId) return null;

  if (typeof mockShopResolver === 'function') {
    const mockShop = mockShopResolver(normalizedId);
    if (mockShop) return mockShop;
  }

  const seller = await findSellerRecordById(normalizedId);
  const ownerUserId = seller?.userId || seller?.UserId || normalizedId;
  const businessName =
    seller?.businessName ||
    seller?.BusinessName ||
    seller?.shopName ||
    seller?.ShopName ||
    (await getSellerBusinessName(normalizedId)) ||
    `Shop ${normalizedId.substring(0, 8).toUpperCase()}`;

  return {
    id: normalizedId,
    name: businessName,
    avatar: resolveSellerAvatar(seller, ownerUserId),
    isOnline: true,
    lastOnline: 'Online vài phút trước',
    isMall: Boolean(seller?.isMall ?? seller?.IsMall),
    badge: seller?.badge || seller?.Badge || 'Nexus Mall',
    addressMasked: seller?.address || seller?.Address || 'Việt Nam',
    companyMasked: businessName,
    stats: {
      products: String(seller?.productCount ?? seller?.ProductCount ?? '—'),
      following: '—',
      chatResponseRate: '98%',
      followers: '—',
      rating: '4.9',
      reviewCount: '—',
      joined: '—',
      address: seller?.address || seller?.Address || 'Việt Nam',
      company: businessName,
    },
  };
}

/** Map sản phẩm API → format catalog ShopProfilePage dùng. */
export function mapApiItemsToShopCatalog(rawItems, shopId) {
  const items = Array.isArray(rawItems) ? rawItems : [];

  return items
    .filter((item) => productIdsMatch(item.sellerUserId || item.sellerId || item.shopId, shopId))
    .map((item, index) => {
      const card = mapProductListItem(item);
      if (!card?.id) return null;

      return {
        ...card,
        shopId,
        categoryId: item.categoryId || item.category?.id || null,
        rating: card.rating ?? 5,
        soldNumeric: Number(item.soldCount ?? item.sold ?? index * 10 + 1),
        monthlySold: card.soldCount || '—',
        popularity: Math.max(1, 100 - index),
        createdAt: Date.now() - index * 86400000,
        isSuggested: index < 6,
        isBestSeller: index < 6,
      };
    })
    .filter(Boolean);
}



const CATEGORY_ICONS = [
  '/images/categories/cat-fashion.jpg',
  '/images/categories/cat-tech.jpg',
  '/images/categories/cat-car.jpg',
  '/images/categories/cat-art.jpg',
];

const DEFAULT_PRODUCT_IMAGE = '/images/products/electronics/iphone.jpg';

/** Lấy ID sản phẩm thống nhất — ưu tiên productId (field backend ecommerce). */
export function resolveProductId(item) {
  if (item == null) return null;
  if (typeof item === 'string' || typeof item === 'number') {
    const str = String(item).trim();
    return str || null;
  }

  const candidates = [
    item.productId,
    item.ProductId,
    item.id,
    item.Id,
  ];

  for (const candidate of candidates) {
    if (candidate != null && String(candidate).trim() !== '') {
      return String(candidate).trim();
    }
  }

  return null;
}

export function productIdsMatch(left, right) {
  if (left == null || right == null) return false;
  return String(left).trim().toLowerCase() === String(right).trim().toLowerCase();
}

/** Lọc sản phẩm cùng shop / cùng danh mục từ raw API items → card cho ProductGrid */
export function buildRelatedProductLists(rawItems, currentProduct) {
  const items = Array.isArray(rawItems) ? rawItems : [];
  const currentId = resolveProductId(currentProduct);
  const currentSellerId =
    currentProduct?.sellerUserId ||
    currentProduct?.shop?.id ||
    currentProduct?.shopId ||
    null;
  const currentCategoryId = currentProduct?.categoryId || null;
  const currentCategoryName =
    currentProduct?.categoryName ||
    currentProduct?.category?.[1]?.label ||
    null;

  const others = items.filter((item) => {
    const itemId = resolveProductId(item);
    if (!currentId) return Boolean(itemId);
    return itemId && !productIdsMatch(itemId, currentId);
  });

  const sellerItems = others.filter((item) => {
    const sellerId = item.sellerUserId || item.sellerId || item.shopId || item.shop?.id;
    return currentSellerId && productIdsMatch(sellerId, currentSellerId);
  });

  const categoryItems = others.filter((item) => {
    const catId = item.categoryId || item.category?.id;
    const catName = item.categoryName || item.category?.name;
    if (currentCategoryId && catId && productIdsMatch(catId, currentCategoryId)) return true;
    if (
      currentCategoryName &&
      catName &&
      String(catName).trim().toLowerCase() === String(currentCategoryName).trim().toLowerCase()
    ) {
      return true;
    }
    return false;
  });

  const toCards = (list) =>
    list.map(mapProductListItem).filter((p) => p?.id);

  return {
    shop: toCards(sellerItems.length > 0 ? sellerItems : others),
    similar: toCards(categoryItems.length > 0 ? categoryItems : [...others].reverse()),
  };
}

const CATEGORY_IMAGE_BY_NAME = {
  'điện thoại': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80',
  'máy tính': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80',
  'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80',
  'đồng hồ': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80',
  'thời trang': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&q=80',
  'sắc đẹp': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80',
  'giày': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
  'sức khỏe': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&q=80',
  'thiết bị': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&q=80',
  'mẹ & bé': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80',
  'thể thao': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=300&q=80',
  'bách hóa': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80',
  'balo': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80',
  'máy ảnh': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80',
  'nhà cửa': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=300&q=80',
  'thú cưng': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&q=80',
  'sách': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&q=80',
  'trang sức': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80',
};

const resolveCategoryImage = (cat, index) => {
  if (cat.imageUrl && (cat.imageUrl.startsWith('http') || cat.imageUrl.startsWith('/'))) {
    return cat.imageUrl;
  }
  if (cat.imageKey && (cat.imageKey.startsWith('http') || cat.imageKey.startsWith('/'))) {
    return cat.imageKey;
  }
  if (cat.image && (cat.image.startsWith('http') || cat.image.startsWith('/'))) {
    return cat.image;
  }

  try {
    const store = JSON.parse(localStorage.getItem('cat_images_store') || '{}');
    const localSaved = store[cat.categoryId || cat.id] || store[cat.name];
    if (localSaved && (localSaved.startsWith('http') || localSaved.startsWith('data:') || localSaved.startsWith('/'))) {
      return localSaved;
    }
  } catch {
    // ignore
  }

  const lowerName = String(cat.name || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGE_BY_NAME)) {
    if (lowerName.includes(key)) {
      return url;
    }
  }

  return CATEGORY_ICONS[index % CATEGORY_ICONS.length];
};

/**
 * Cây danh mục public — GET /api/v1/categories (Real API, 100% không dùng mock)
 */
export async function getCategoryTree(params = {}) {
  try {
    const { data } = await api.get('/categories', {
      params: { view: 'tree', includeInactive: false, pageSize: 100, ...params },
      skipErrorRedirect: true,
    });
    const payload = unwrapData(data) || data?.data || data;
    const rawItems = payload?.tree || payload?.items || (Array.isArray(payload) ? payload : []);

    return rawItems.map((cat, index) => {
      const id = cat.categoryId || cat.id;
      const name = cat.name || cat.categoryName || 'Danh mục';
      return {
        id,
        categoryId: id,
        name,
        icon: resolveCategoryImage(cat, index),
        slug: cat.slug || '',
      };
    });
  } catch (err) {
    console.error('Failed to load categories from API:', err);
    return [];
  }
}

export function mapCategoryItem(cat, index = 0) {
  return {
    id: cat.id || cat.categoryId,
    name: cat.name || cat.categoryName || 'Danh mục',
    icon: cat.icon?.startsWith?.('/') || cat.icon?.startsWith?.('http')
      ? cat.icon
      : CATEGORY_ICONS[index % CATEGORY_ICONS.length],
  };
}

const resolveProductDefaultImage = (item) => {
  const name = String(item?.name || item?.productName || item?.title || item?.categoryName || item?.category?.name || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGE_BY_NAME)) {
    if (name.includes(key)) {
      return url;
    }
  }
  return DEFAULT_PRODUCT_IMAGE;
};

/** Map item API → field ProductGrid / ProductCard cần */
export function mapProductListItem(item) {
  if (!item) return null;

  const images = Array.isArray(item.images) ? item.images : [];
  const firstImage = images[0];
  const rawUrl = typeof firstImage === 'string'
    ? firstImage
    : firstImage?.url || firstImage?.imageUrl;

  const singleImg = item.imageUrl || item.primaryImageUrl || item.coverImageUrl || item.image || rawUrl;
  const resolved = singleImg ? resolveImageUrl(singleImg) : '';

  const finalImage = resolved || resolveProductDefaultImage(item);
  const finalTitle = item.productName || item.name || item.title || 'Sản phẩm E-Commerce';
  const priceVal = item.price ?? item.minPrice ?? item.unitPrice ?? item.skuMinPrice ?? item.skus?.[0]?.price ?? 0;

  return {
    id: resolveProductId(item),
    image: finalImage,
    title: finalTitle,
    price: Number(priceVal) || 0,
    discountPercent: item.discountPercent ?? item.discount ?? null,
    soldCount: formatSoldCount(item.soldCount ?? item.sold ?? item.totalSold),
    tags: Array.isArray(item.tags) ? item.tags : [],
    rating: item.rating ?? item.averageRating ?? 5.0,
    sellerUserId: item.sellerUserId || item.sellerId || item.shopId || null,
    shopId: item.shopId || item.sellerId || item.sellerUserId || null,
    categoryId: item.categoryId || item.category?.id || null,
    categoryName: item.categoryName || item.category?.name || null,
  };
}

/** @deprecated dùng mapProductListItem */
export const mapDiscoveryProduct = mapProductListItem;

const formatSoldCount = (value) => {
  if (value == null || value === '') return '';
  if (typeof value === 'string') return value;
  if (value >= 1000) return `${Math.floor(value / 1000)}k+`;
  return `${value}`;
};

export function mapProductDetailToUi(rawItem, defaults = {}) {
  const item = rawItem?.data || rawItem;
  if (!item || typeof item !== 'object') return defaults;

  const productTitle =
    item.productName ||
    item.name ||
    item.title ||
    defaults.title ||
    'Sản phẩm E-Commerce';

  const base = {
    gallery: [],
    variants: [],
    policies: [],
    rating: 0,
    reviewCount: 0,
    soldCount: '',
    priceMin: 0,
    priceMax: 0,
    originalPrice: 0,
    discountPercent: 0,
    stock: 0,
    likeCount: 0,
    attributes: {},
    shop: null,
    ...defaults,
  };

  const skus = Array.isArray(item.skus) ? item.skus : (Array.isArray(item.variants) ? item.variants : []);

  // Collect candidate images from item.images, item.imageUrl, item.primaryImageUrl, item.coverImageUrl, item.image, and SKUs
  const rawImages = Array.isArray(item.images) ? item.images : [];
  const candidateImages = [...rawImages];

  const singleImg = item.imageUrl || item.primaryImageUrl || item.coverImageUrl || item.image;
  if (singleImg) candidateImages.push(singleImg);

  skus.forEach((sku) => {
    const skuImg = sku.imageUrl || sku.image;
    if (skuImg) candidateImages.push(skuImg);
  });

  const resolvedUrls = candidateImages
    .map((img) => resolveImageUrl(img) || (typeof img === 'string' ? img : img?.url || img?.imageUrl || ''))
    .filter(Boolean);

  const uniqueUrls = Array.from(new Set(resolvedUrls));
  const fallbackImg = resolveProductDefaultImage(item);
  const gallerySources = uniqueUrls.length > 0 ? uniqueUrls : [fallbackImg];

  const gallery = gallerySources.map((src, i) => ({
    id: `g-${i + 1}`,
    src,
    alt: item.name ?? item.title ?? `Ảnh ${i + 1}`,
    isVideo: false,
  }));

  // Parse SKU prices — check unitPrice first (backend field), then fallbacks
  const skuPrices = skus
    .map(s => Number(s.unitPrice ?? s.price ?? s.salePrice ?? s.originalPrice ?? s.priceAmount ?? 0))
    .filter(p => p > 0);

  const fallbackPrice = Number(item.price ?? item.minPrice ?? item.priceAmount ?? 0);
  const minP = skuPrices.length ? Math.min(...skuPrices) : (fallbackPrice > 0 ? fallbackPrice : 150000);
  const maxP = skuPrices.length ? Math.max(...skuPrices) : (Number(item.maxPrice) > 0 ? Number(item.maxPrice) : minP);

  // Extract stock from SKU attributes — backend returns attributes as JsonElement object (public) or attributesJson string (management)
  const extractSkuStock = (s) => {
    let st = Number(s.stockQuantity ?? s.stock ?? s.quantity ?? 0);
    if (st > 0) return st;
    // Parse from attributes object (PublicProductSkuResponse) or attributesJson string (ProductSkuResponse)
    let attrs = null;
    if (typeof s.attributes === 'object' && s.attributes !== null) {
      attrs = s.attributes;
    } else if (typeof s.attributesJson === 'string') {
      try { attrs = JSON.parse(s.attributesJson); } catch { /* ignore */ }
    }
    if (attrs) {
      st = Number(attrs.stock ?? attrs.stockQuantity ?? attrs.quantity ?? 0);
    }
    return st > 0 ? st : 10;
  };

  const skuStockSum = skus.reduce((sum, s) => sum + extractSkuStock(s), 0);
  const rawStock = Number(item.stock ?? item.totalStock ?? item.quantity ?? 0);
  const totalStock = rawStock > 0 ? rawStock : (skuStockSum > 0 ? skuStockSum : (skus.length ? skus.length * 10 : 100));

  const discount = item.discountPercent ?? item.discount ?? 0;
  const originalPrice = discount
    ? Math.round(minP / (1 - discount / 100))
    : base.originalPrice ?? minP * 1.2;

  // Extract variant display name from SKU attributes
  // Backend PublicProductSkuResponse fields: skuId, skuName, unitPrice, currency, status, isDefault, attributes (JsonElement)
  // Backend ProductSkuResponse fields: skuId, skuCode, skuName, unitPrice, currency, status, isDefault, attributesJson, priceVersion, rowVersion
  const IGNORED_ATTR_KEYS = new Set(['stock', 'stockQuantity', 'quantity', 'condition', 'barcode']);

  const extractVariantName = (sku, index) => {
    // 1. Check skuName (backend field) or name — use if it's a real variant name
    const rawName = sku.skuName ?? sku.name;
    if (rawName && !/^(Biến thể|Phân loại|SKU-|DEFAULT|Mặc định)/i.test(rawName)) {
      return rawName;
    }

    // 2. Extract variant dimension values from attributes (JsonElement object) or attributesJson (string)
    let attrs = null;
    if (typeof sku.attributes === 'object' && sku.attributes !== null) {
      attrs = sku.attributes;
    }
    if (!attrs && typeof sku.attributesJson === 'string') {
      try { attrs = JSON.parse(sku.attributesJson); } catch { /* ignore */ }
    }

    if (attrs && typeof attrs === 'object') {
      const variantValues = Object.entries(attrs)
        .filter(([key]) => !IGNORED_ATTR_KEYS.has(key))
        .map(([, val]) => String(val))
        .filter(Boolean);
      if (variantValues.length > 0) {
        return variantValues.join(' - ');
      }
    }

    // 3. Fallback to raw name, skuCode, or generic label
    return rawName || sku.skuCode || sku.code || `Biến thể ${index + 1}`;
  };

  const variants = skus.length
    ? skus.map((sku, i) => {
        const skuP = Number(sku.unitPrice ?? sku.price ?? sku.salePrice ?? sku.originalPrice ?? minP);
        const skuS = extractSkuStock(sku);
        const rawSkuImg = sku.imageUrl ?? sku.image;
        const resolvedSkuImg = rawSkuImg ? resolveImageUrl(rawSkuImg) : null;
        return {
          id: sku.skuId ?? sku.id ?? `v-${i + 1}`,
          name: extractVariantName(sku, i),
          image: resolvedSkuImg || gallery[0]?.src || fallbackImg,
          price: skuP > 0 ? skuP : minP,
          stock: skuS > 0 ? skuS : 10,
        };
      })
    : base.variants;

  const brandName = item.brandName || item.brand || 'Apple';
  const categoryName = item.categoryName ?? item.category?.name ?? 'Điện Thoại & Phụ Kiện';
  const targetSellerId = String(item.sellerUserId || item.sellerId || item.shopId || '').toLowerCase().trim();
  const knownBusinessName = SQL_SERVER_SELLERS_MAP[targetSellerId];

  const shopName =
    knownBusinessName ||
    item.businessName ||
    item.shopName ||
    item.shop?.name ||
    item.sellerName ||
    item.seller ||
    (item.sellerUserId ? `Shop ${String(item.sellerUserId).substring(0, 8).toUpperCase()}` : 'Gian hàng Official');

  const shopObj = {
    id: item.sellerUserId || item.sellerId || item.shopId || 'shop-1',
    name: shopName,
    avatar: item.sellerAvatarUrl || item.shopAvatar || item.shop?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    badge: 'Nexus Mall',
    isOnline: true,
    lastOnline: 'Online vài phút trước',
    stats: Array.isArray(item.shop?.stats) ? item.shop.stats : [
      { label: 'Đánh Giá', value: '4.9/5' },
      { label: 'Sản Phẩm', value: '24' },
      { label: 'Tỉ Lệ Phản Hồi', value: '99%' },
      { label: 'Thời Gian Phản Hồi', value: 'trong vài giờ' },
      { label: 'Tham Gia', value: '1 năm trước' },
      { label: 'Người Theo Dõi', value: '12.5k' },
    ],
  };



  const rawRating = Number(item.rating ?? item.averageRating ?? 0);
  const reviewCount = Number(item.reviewCount ?? item.totalReviews ?? base.reviewCount ?? 0);
  const rating = (rawRating > 0 && reviewCount > 0) ? rawRating : 5.0;

  return {
    ...base,
    id: resolveProductId(item) ?? base.id,
    title: productTitle,
    sellerUserId: item.sellerUserId || item.sellerId || item.shopId || shopObj.id,
    shopId: item.shopId || item.sellerId || item.sellerUserId || shopObj.id,
    categoryId: item.categoryId || item.category?.id || null,
    categoryName,
    badge: item.badge ?? base.badge ?? null,
    rating,
    reviewCount,

    soldCount: formatSoldCount(item.soldCount ?? item.sold) || base.soldCount,
    priceMin: minP,
    priceMax: maxP,
    originalPrice,
    discountPercent: discount,
    shipping: item.shipping ?? base.shipping,
    shippingNote: item.shippingNote ?? base.shippingNote,
    inStock: totalStock > 0,
    stock: totalStock,
    likeCount: item.likeCount ?? base.likeCount ?? 0,
    category: [
      { label: 'Trang chủ', href: '/' },
      { label: categoryName, href: '#' },
      { label: productTitle, href: null },
    ],
    policies: base.policies,
    variants,
    shop: shopObj,
    attributes: {
      category: `BidDoubleTk > ${categoryName} > ${productTitle}`,
      brand: brandName,
      stock: totalStock > 0 ? String(totalStock) : '100',
      warranty: item.warranty || 'Bảo hành chính hãng 12 tháng',
      origin: item.origin || 'Chính hãng',
      shipFrom: item.shipFrom || item.address || 'TP. Hồ Chí Minh',
    },
    description: item.description ?? base.description ?? '',
    gallery,
    shop: item.shop
      ? {
          id: item.shop.id ?? item.shopId ?? shopObj.id,
          name: item.shop.name ?? item.shopName ?? shopObj.name,
          avatar: item.shop.avatar ?? item.shop.avatarUrl ?? shopObj.avatar,
          isOnline: item.shop.isOnline ?? shopObj.isOnline,
          lastOnline: item.shop.lastOnline ?? shopObj.lastOnline,
          badge: item.shop.badge ?? shopObj.badge,
          stats: item.shop.stats || shopObj.stats,
        }
      : shopObj,
  };
}

