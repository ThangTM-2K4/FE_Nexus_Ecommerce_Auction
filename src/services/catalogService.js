import api from '../config/api';
import { unwrapData, getApiErrorMessage } from '../utils/apiResponse';
import { getCategories as fetchCategories } from './categoryService';
import { getProducts, getProductById, resolveImageUrl } from './ecommerceProductService';

export { getApiErrorMessage, getProducts, getProductById };

const CATEGORY_ICONS = [
  '/images/categories/cat-fashion.jpg',
  '/images/categories/cat-tech.jpg',
  '/images/categories/cat-car.jpg',
  '/images/categories/cat-art.jpg',
];

const DEFAULT_PRODUCT_IMAGE = '/images/products/electronics/iphone.jpg';

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
    id: item.id ?? item.productId,
    image: finalImage,
    title: finalTitle,
    price: Number(priceVal) || 0,
    discountPercent: item.discountPercent ?? item.discount ?? null,
    soldCount: formatSoldCount(item.soldCount ?? item.sold ?? item.totalSold),
    tags: Array.isArray(item.tags) ? item.tags : [],
    rating: item.rating ?? item.averageRating ?? 5.0,
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

export function mapProductDetailToUi(item, defaults = {}) {
  if (!item) return defaults;

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
  const productTitle = item.name ?? item.title ?? base.title ?? 'Sản phẩm';
  const sellerName = item.sellerName || item.shopName || item.seller || 'BidDoubleTk Official Store';

  const shopObj = item.shop || {
    id: item.sellerUserId || item.sellerId || 'shop-1',
    name: sellerName,
    avatar: item.sellerAvatarUrl || item.shopAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    badge: 'BidDoubleTk Mall',
    isOnline: true,
    lastOnline: 'Online vài phút trước',
    stats: [
      { label: 'Đánh Giá', value: '179,4k' },
      { label: 'Sản Phẩm', value: '614' },
      { label: 'Tỉ Lệ Phản Hồi', value: '100%' },
      { label: 'Thời Gian Phản Hồi', value: 'trong vài giờ' },
      { label: 'Tham Gia', value: '2 năm trước' },
      { label: 'Người Theo Dõi', value: '976,5k' },
    ],
  };

  const rawRating = Number(item.rating ?? item.averageRating ?? 0);
  const reviewCount = Number(item.reviewCount ?? item.totalReviews ?? base.reviewCount ?? 0);
  const rating = (rawRating > 0 && reviewCount > 0) ? rawRating : 5.0;

  return {
    ...base,
    id: item.id ?? item.productId ?? base.id,
    title: productTitle,
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
          id: item.shop.id ?? item.shopId ?? base.shop?.id,
          name: item.shop.name ?? item.shopName ?? base.shop?.name,
          avatar: item.shop.avatar ?? item.shop.avatarUrl ?? base.shop?.avatar,
          isOnline: item.shop.isOnline ?? base.shop?.isOnline,
          lastOnline: item.shop.lastOnline ?? base.shop?.lastOnline,
          badge: item.shop.badge ?? base.shop?.badge,
          stats: item.shop.stats ?? base.shop?.stats,
        }
      : base.shop,
  };
}
