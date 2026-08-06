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
 * Chi tiết sản phẩm — GET /ecommerce/products/{productId}?scope=management
 */
export async function getProductById(productId, scope = 'management') {
  if (!productId) {
    return {
      ok: false,
      data: null,
      error: 'Thiếu productId',
      status: 400,
    };
  }

  const path = `${BUYER_LIST_PATH}/${productId}`;

  try {
    const { data } = await api.get(path, { params: { scope } });
    return {
      ok: true,
      data: unwrapData(data),
      status: 200,
    };
  } catch (error) {
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

/**
 * Tạo sản phẩm ecommerce — POST /ecommerce/products
 */
export async function createEcommerceProduct(payload) {
  const { data } = await api.post('/ecommerce/products', payload);
  const result = unwrapData(data);
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
export async function attachProductImage(productId, imageData, rowVersion) {
  const headers = { 'If-Match': rowVersion || '*' };
  const { data } = await api.post(`/ecommerce/products/${productId}/images`, imageData, { headers });
  return unwrapData(data);
}

/**
 * Tạo SKU — POST /ecommerce/products/{productId}/skus
 */
export async function createProductSku(productId, skuData, rowVersion) {
  const headers = { 'If-Match': rowVersion || '*' };
  const { data } = await api.post(`/ecommerce/products/${productId}/skus`, skuData, { headers });
  return unwrapData(data);
}

/**
 * Gửi duyệt — POST /ecommerce/products/{productId}/submit-review
 */
export async function submitProductForReview(productId, rowVersion) {
  // 1. Check moderation
  const moderation = await getProductModeration(productId);
  const status = moderation?.moderationStatus || moderation?.data?.moderationStatus;

  if (status === "PENDING_MANUAL_REVIEW") {
    throw new Error("Sản phẩm đang chờ duyệt");
  }

  if (status === "APPROVED") {
    throw new Error("Sản phẩm đã được duyệt");
  }

  const finalRowVersion =
    rowVersion ||
    moderation?.rowVersion ||
    moderation?.data?.rowVersion ||
    null;

  // 2. Submit
  const key =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `key-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  try {
    const { data } = await api.post(
      `/ecommerce/products/${productId}/submit-review`,
      {
        rowVersion: finalRowVersion,
        operationKey: key,
        idempotencyKey: key,
        callerPayloadHash: null,
      },
      {
        headers: {
          'If-Match': finalRowVersion || '*',
          'X-Operation-Key': key,
          'X-Idempotency-Key': key,
        },
      }
    );

    return unwrapData(data);
  } catch (err) {
    if (err?.response?.status === 409) {
      return { moderationStatus: "PENDING_MANUAL_REVIEW" };
    }
    throw err;
  }
}

/**
 * Danh sách sản phẩm của seller — GET /seller/products?scope=management
 */
export async function getMyEcommerceProducts(params = {}) {
  const { data } = await api.get('/seller/products', { params: { scope: 'management', ...params } });
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
  try {
    const { data } = await api.get(`/ecommerce/products/${productId}/moderation`);
    return unwrapData(data);
  } catch (err) {
    return null;
  }
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

  const rawStatus = String(item.status || item.moderationStatus || '').toUpperCase();

  const moderationStatus =
    item.moderationStatus ||
    item.moderation_status ||
    item.moderation?.status ||
    item.reviewStatus ||
    item.approvalStatus ||
    (rawStatus.includes('PENDING') || rawStatus.includes('REVIEW') || rawStatus.includes('CHỜ')
      ? 'PENDING_MANUAL_REVIEW'
      : 'NONE');

  const stock =
    item.stockQuantity ??
    item.stock ??
    item.totalStock ??
    item.quantity ??
    item.availableStock ??
    item.skus?.[0]?.stockQuantity ??
    item.skus?.[0]?.stock ??
    item.skus?.[0]?.quantity ??
    0;

  const price =
    item.price ??
    item.unitPrice ??
    item.sellingPrice ??
    item.minPrice ??
    item.skus?.[0]?.unitPrice ??
    item.skus?.[0]?.price ??
    0;

  return {
    id: item.id ?? item.productId,
    name: item.name ?? item.title ?? '',
    category: item.categoryId ?? item.category ?? '',
    brand: item.brand ?? '',
    price,
    stock,
    status: normalizeStatus(item.status ?? moderationStatus),
    moderationStatus,
    rowVersion: item.rowVersion ?? item.version ?? null,
    images,
    description: item.description ?? '',
    createdAt: item.createdAt,
  };
}
