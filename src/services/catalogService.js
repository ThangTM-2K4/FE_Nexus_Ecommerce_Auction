import api from '../config/api';
import { unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';
import { ensureCategoryTree } from './adminCategoryService';
import { getProducts, getProductById } from './ecommerceProductService';

export { getApiErrorMessage, getProducts, getProductById };

const CATEGORY_ICONS = [
  '/images/categories/cat-fashion.jpg',
  '/images/categories/cat-tech.jpg',
  '/images/categories/cat-car.jpg',
  '/images/categories/cat-art.jpg',
];

const DEFAULT_PRODUCT_IMAGE = '/images/products/electronics/iphone.jpg';

/**
 * Cây danh mục public — GET /categories
 */
export async function getCategoryTree(params = {}) {
  const { data } = await api.get('/categories', { params, skipErrorRedirect: true });
  const paged = unwrapPagedList(data);
  const tree = ensureCategoryTree(paged.items || []);
  return flattenCategoryTree(tree);
}

const flattenCategoryTree = (tree) => {
  const result = [];
  tree.forEach((parent, pIdx) => {
    result.push(mapCategoryItem(parent, pIdx));
    (parent.children || []).forEach((child, cIdx) => {
      result.push(mapCategoryItem(child, pIdx * 10 + cIdx + 1));
    });
  });
  return result;
};

export function mapCategoryItem(cat, index = 0) {
  return {
    id: cat.id,
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

  return {
    id: item.id ?? item.productId,
    image: item.imageUrl ?? item.coverImageUrl ?? item.image ?? imageUrl ?? DEFAULT_PRODUCT_IMAGE,
    title: item.name ?? item.title ?? 'Sản phẩm',
    price: item.price ?? item.minPrice ?? item.skuMinPrice ?? item.skus?.[0]?.price ?? 0,
    discountPercent: item.discountPercent ?? item.discount ?? null,
    soldCount: formatSoldCount(item.soldCount ?? item.sold ?? item.totalSold),
    tags: Array.isArray(item.tags) ? item.tags : [],
    rating: item.rating ?? item.averageRating ?? null,
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

  const price = item.price ?? item.minPrice ?? item.skus?.[0]?.price ?? base.priceMin ?? 0;
  const maxPrice = item.maxPrice ?? item.skus?.[item.skus?.length - 1]?.price ?? price;
  const discount = item.discountPercent ?? item.discount ?? 0;
  const originalPrice = discount
    ? Math.round(price / (1 - discount / 100))
    : base.originalPrice ?? price * 1.2;

  const skus = Array.isArray(item.skus) ? item.skus : [];
  const variants = skus.length
    ? skus.map((sku, i) => ({
        id: sku.id ?? `v-${i + 1}`,
        name: sku.name ?? sku.skuCode ?? `Biến thể ${i + 1}`,
        image: sku.imageUrl ?? gallery[0]?.src ?? DEFAULT_PRODUCT_IMAGE,
        price: sku.price ?? price,
      }))
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
    priceMin: price,
    priceMax: maxPrice,
    originalPrice,
    discountPercent: discount,
    shipping: item.shipping ?? base.shipping,
    shippingNote: item.shippingNote ?? base.shippingNote,
    inStock: (item.stock ?? item.totalStock ?? base.stock ?? 0) > 0,
    stock: item.stock ?? item.totalStock ?? base.stock ?? 0,
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
