import api from '../config/api';
import { unwrapData, getApiErrorMessage } from '../utils/apiResponse';
import { getCategories as fetchCategories } from './categoryService';
import { getProducts, getProductById } from './ecommerceProductService';

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

/** Map item API → field ProductGrid / ProductCard cần */
export function mapProductListItem(item) {
  if (!item) return null;

  const images = Array.isArray(item.images) ? item.images : [];
  const firstImage = images[0];
  const imageUrl = typeof firstImage === 'string'
    ? firstImage
    : firstImage?.url || firstImage?.imageUrl;

  const finalImage = item.imageUrl || item.primaryImageUrl || item.coverImageUrl || item.image || imageUrl || DEFAULT_PRODUCT_IMAGE;
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

  const images = Array.isArray(item.images) ? item.images : [];
  const gallery = images.length
    ? images.map((img, i) => {
        const src = typeof img === 'string' ? img : img.url || img.imageUrl || DEFAULT_PRODUCT_IMAGE;
        return {
          id: `g-${i + 1}`,
          src,
          alt: item.name ?? item.title ?? `Ảnh ${i + 1}`,
          isVideo: false,
        };
      })
    : base.gallery;

  const skus = Array.isArray(item.skus) ? item.skus : (Array.isArray(item.variants) ? item.variants : []);
  
  const skuPrices = skus
    .map(s => Number(s.price ?? s.salePrice ?? s.originalPrice ?? s.priceAmount ?? 0))
    .filter(p => p > 0);

  const fallbackPrice = Number(item.price ?? item.minPrice ?? item.priceAmount ?? 0);
  const minP = skuPrices.length ? Math.min(...skuPrices) : (fallbackPrice > 0 ? fallbackPrice : 150000);
  const maxP = skuPrices.length ? Math.max(...skuPrices) : (Number(item.maxPrice) > 0 ? Number(item.maxPrice) : minP);

  const skuStockSum = skus.reduce((sum, s) => sum + Number(s.stockQuantity ?? s.stock ?? s.quantity ?? 0), 0);
  const rawStock = Number(item.stock ?? item.totalStock ?? item.quantity ?? 0);
  const totalStock = rawStock > 0 ? rawStock : (skuStockSum > 0 ? skuStockSum : (skus.length ? skus.length * 10 : 100));

  const discount = item.discountPercent ?? item.discount ?? 0;
  const originalPrice = discount
    ? Math.round(minP / (1 - discount / 100))
    : base.originalPrice ?? minP * 1.2;

  const variants = skus.length
    ? skus.map((sku, i) => {
        const skuP = Number(sku.price ?? sku.salePrice ?? sku.originalPrice ?? minP);
        const skuS = Number(sku.stockQuantity ?? sku.stock ?? sku.quantity ?? 10);
        return {
          id: sku.id ?? `v-${i + 1}`,
          name: sku.name ?? sku.skuCode ?? sku.code ?? (sku.attributes ? Object.values(sku.attributes).join(" - ") : `Biến thể ${i + 1}`),
          image: sku.imageUrl ?? sku.image ?? gallery[0]?.src ?? DEFAULT_PRODUCT_IMAGE,
          price: skuP > 0 ? skuP : minP,
          stock: skuS > 0 ? skuS : 10,
        };
      })
    : base.variants;

  const categoryName = item.categoryName ?? item.category?.name ?? 'Danh mục';
  const productTitle = item.name ?? item.title ?? base.title ?? 'Sản phẩm';

  return {
    ...base,
    id: item.id ?? item.productId ?? base.id,
    title: productTitle,
    badge: item.badge ?? base.badge ?? null,
    rating: item.rating ?? item.averageRating ?? base.rating ?? 0,
    reviewCount: item.reviewCount ?? base.reviewCount ?? 0,
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
    attributes: {
      category: categoryName,
      stock: String(item.stock ?? item.totalStock ?? base.stock ?? '—'),
      warranty: item.warranty ?? base.attributes?.warranty ?? '—',
      origin: item.origin ?? base.attributes?.origin ?? '—',
      shipFrom: item.shipFrom ?? base.attributes?.shipFrom ?? '—',
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
