import api, { BACKEND_BASE_URL } from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';
import { extractUploadKey, normalizeUploadKey } from './uploadResponse';

export { getApiErrorMessage };

const MULTIPART = { headers: { 'Content-Type': undefined } };
const BUYER_LIST_PATH = '/ecommerce/products';
const isDev = import.meta.env.DEV;

const ALLOWED_PRODUCT_FILTERS = new Set([
  'search',
  'categoryId',
  'minPrice',
  'maxPrice',
  'sortBy',
  'sortDirection',
  'pageNumber',
  'pageSize',
]);

const cleanQueryParams = (filters = {}) => {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (!ALLOWED_PRODUCT_FILTERS.has(key)) return;
    if (value === undefined || value === null || value === '') return;
    params[key] = value;
  });
  return params;
};

const normalizeProductFilters = (filters = {}) => {
  const { page, pageNumber, pageSize, ...rest } = filters;
  const next = { ...rest };

  if (pageNumber != null) next.pageNumber = pageNumber;
  else if (page != null) next.pageNumber = page;

  if (pageSize != null) next.pageSize = pageSize;

  return cleanQueryParams(next);
};

const logDevRequest = (method, path, params) => {
  if (!isDev) return;
  const base = (BACKEND_BASE_URL || '').replace(/\/$/, '');
  const query = params ? new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString() : '';
  const url = query ? `${base}${path}?${query}` : `${base}${path}`;
  console.info(`[ecommerceProductService] ${method} ${url}`, params ?? {});
};

const logDevError = (label, error) => {
  if (!isDev) return;
  console.error(`[ecommerceProductService] ${label}`, error?.response?.status, error?.response?.data ?? error);
};

const buyerRequestConfig = { skipErrorRedirect: true };

/**
 * Danh sách sản phẩm phía khách mua — GET /ecommerce/products
 * Query: search, categoryId, minPrice, maxPrice, sortBy, sortDirection, pageNumber, pageSize
 */
export async function getProducts(filters = {}) {
  const params = normalizeProductFilters(filters);
  logDevRequest('GET', BUYER_LIST_PATH, params);

  try {
    const { data } = await api.get(BUYER_LIST_PATH, { params, ...buyerRequestConfig });
    const paged = unwrapPagedList(data);
    return {
      ok: true,
      items: paged.items || [],
      total: paged.total ?? 0,
      pageNumber: paged.page ?? params.pageNumber ?? 1,
      pageSize: paged.pageSize ?? params.pageSize ?? 20,
    };
  } catch (error) {
    logDevError('getProducts failed', error);
    return {
      ok: false,
      error: getApiErrorMessage(error, 'Không tải được danh sách sản phẩm'),
      items: [],
      total: 0,
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 20,
      status: error?.response?.status ?? 0,
    };
  }
}

/**
 * Chi tiết sản phẩm phía khách mua — GET /ecommerce/products/{productId}
 */
export async function getProductById(productId) {
  if (!productId) {
    return {
      ok: false,
      data: null,
      error: 'Thiếu productId',
      status: 400,
    };
  }

  const path = `${BUYER_LIST_PATH}/${productId}`;
  logDevRequest('GET', path);

  try {
    const { data } = await api.get(path, buyerRequestConfig);
    return {
      ok: true,
      data: unwrapData(data),
      status: 200,
    };
  } catch (error) {
    logDevError('getProductById failed', error);
    return {
      ok: false,
      data: null,
      error: getApiErrorMessage(error, 'Không tải được chi tiết sản phẩm'),
      status: error?.response?.status ?? 0,
    };
  }
}

const getUploadPayload = (response) => response?.data?.data ?? response?.data ?? {};

const extractUploadUrl = (response) => {
  const data = getUploadPayload(response);
  if (typeof data === 'string') return data;
  return data.url || data.fileUrl || data.imageUrl || '';
};

const extractProductId = (payload) =>
  payload?.id ?? payload?.productId ?? payload?.data?.id ?? payload?.data?.productId;

const DEFAULT_SALES_CHANNEL = 'Ecommerce';
const DEFAULT_CURRENCY = 'VND';
const DEFAULT_ORIGIN_COUNTRY = 'VN';

/**
 * Build payload POST /ecommerce/products theo Swagger CreateProductRequest.
 */
export function buildCreateProductPayload({
  sellerUserId,
  name,
  description,
  categoryId,
  brand,
  price,
  stock,
  condition,
  originCountry,
}) {
  const trimmedName = String(name || '').trim();
  const trimmedDesc = String(description || '').trim();
  const unitPrice = Number(price);
  const stockQty = Number(stock);

  return {
    sellerUserId,
    name: trimmedName,
    description: trimmedDesc,
    categoryId,
    salesChannel: DEFAULT_SALES_CHANNEL,
    brand: brand?.trim() || undefined,
    originCountry: originCountry || DEFAULT_ORIGIN_COUNTRY,
    skus: [
      {
        skuCode: 'DEFAULT',
        skuName: trimmedName || 'Mặc định',
        unitPrice,
        currency: DEFAULT_CURRENCY,
        salesChannel: DEFAULT_SALES_CHANNEL,
        isDefault: true,
        attributes: {
          stock: stockQty,
          condition: condition || 'new',
        },
        barcode: '',
      },
    ],
  };
}

/**
 * Tạo sản phẩm ecommerce — POST /ecommerce/products
 */
export async function createEcommerceProduct(payload) {
  if (isDev) {
    console.info('[ecommerceProductService] POST /ecommerce/products payload', payload);
  }
  const { data } = await api.post('/ecommerce/products', payload);
  const result = unwrapData(data);
  if (isDev) {
    console.info('[ecommerceProductService] POST /ecommerce/products response', result);
  }
  const productId = extractProductId(result);
  return { ...result, productId };
}

/**
 * Upload ảnh sản phẩm — POST /catalog/uploads/product
 */
export async function uploadProductImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const response = await api.post('/catalog/uploads/product', fd, MULTIPART);
  const url = extractUploadUrl(response);
  const key = normalizeUploadKey(extractUploadKey(response) || url);
  if (!url && !key) {
    throw new Error('Server không trả về URL/key ảnh.');
  }
  return { url, key };
}

/**
 * Gắn ảnh vào sản phẩm — POST /ecommerce/products/{productId}/images
 */
export async function attachProductImage(productId, imageData) {
  const { data } = await api.post(`/ecommerce/products/${productId}/images`, imageData);
  return unwrapData(data);
}

/**
 * Tạo SKU — POST /ecommerce/products/{productId}/skus
 */
export async function createProductSku(productId, skuData) {
  const { data } = await api.post(`/ecommerce/products/${productId}/skus`, skuData);
  return unwrapData(data);
}

/**
 * Gửi duyệt — POST /ecommerce/products/{productId}/submit-review
 */
export async function submitProductForReview(productId) {
  const { data } = await api.post(`/ecommerce/products/${productId}/submit-review`);
  return unwrapData(data);
}

/**
 * Danh sách sản phẩm của seller — GET /seller/products
 */
export async function getMyEcommerceProducts(params = {}) {
  const { data } = await api.get('/seller/products', { params });
  const paged = unwrapPagedList(data);
  return {
    ...paged,
    items: (paged.items || []).map(mapSellerProductToUi),
  };
}

/**
 * Cập nhật sản phẩm — PUT /ecommerce/products/{productId}
 */
export async function updateEcommerceProduct(productId, payload) {
  const { data } = await api.put(`/ecommerce/products/${productId}`, payload);
  return unwrapData(data);
}

/**
 * Đổi trạng thái — PATCH /ecommerce/products/{productId}/status
 */
export async function updateProductStatus(productId, status) {
  const { data } = await api.patch(`/ecommerce/products/${productId}/status`, { status });
  return unwrapData(data);
}

/**
 * Trạng thái kiểm duyệt — GET /ecommerce/products/{productId}/moderation
 */
export async function getProductModeration(productId) {
  const { data } = await api.get(`/ecommerce/products/${productId}/moderation`);
  return unwrapData(data);
}

const normalizeStatus = (status) => {
  const raw = String(status || '').toUpperCase();
  if (raw.includes('DRAFT')) return 'DRAFT';
  if (raw.includes('PENDING') || raw.includes('REVIEW') || raw.includes('CHỜ')) return 'PENDING';
  if (raw.includes('APPROV') || raw.includes('ACTIVE') || raw.includes('HOẠT')) return 'APPROVED';
  if (raw.includes('REJECT') || raw.includes('TỪ CHỐI')) return 'REJECTED';
  return raw || 'DRAFT';
};

export function mapSellerProductToUi(item) {
  if (!item) return null;
  const images = Array.isArray(item.images)
    ? item.images.map((img) => (typeof img === 'string' ? img : img.url || img.imageUrl)).filter(Boolean)
    : item.imageUrl
      ? [item.imageUrl]
      : [];

  return {
    id: item.id ?? item.productId,
    name: item.name ?? item.title ?? '',
    category: item.categoryId ?? item.category ?? '',
    brand: item.brand ?? '',
    price: item.price ?? item.minPrice ?? item.skus?.[0]?.price ?? 0,
    stock: item.stock ?? item.totalStock ?? item.skus?.[0]?.stock ?? 0,
    status: normalizeStatus(item.status ?? item.moderationStatus),
    images,
    description: item.description ?? '',
    createdAt: item.createdAt,
  };
}
