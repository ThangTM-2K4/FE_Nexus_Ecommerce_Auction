import api, { BACKEND_BASE_URL } from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

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
 * Danh sách sản phẩm phía khách mua — GET /api/v1/ecommerce/products hoặc GET /api/v1/products
 * Query: search, categoryId, minPrice, maxPrice, sortBy, sortDirection, pageNumber, pageSize
 */
export async function getProducts(filters = {}) {
  const params = normalizeProductFilters(filters);
  logDevRequest('GET', BUYER_LIST_PATH, params);

  // 1. Thử gọi GET /ecommerce/products
  try {
    const { data } = await api.get(BUYER_LIST_PATH, { params, ...buyerRequestConfig });
    const paged = unwrapPagedList(data);
    if (Array.isArray(paged.items) && paged.items.length > 0) {
      return {
        ok: true,
        items: paged.items,
        total: paged.total ?? paged.items.length,
        pageNumber: paged.page ?? params.pageNumber ?? 1,
        pageSize: paged.pageSize ?? params.pageSize ?? 20,
      };
    }
  } catch {
    // ignore
  }

  // 2. Thử gọi GET /api/v1/products?pageSize=100
  try {
    const { data } = await api.get('/products', {
      params: { pageSize: 100, ...params },
      ...buyerRequestConfig,
    });
    const paged = unwrapPagedList(data);
    if (Array.isArray(paged.items) && paged.items.length > 0) {
      return {
        ok: true,
        items: paged.items,
        total: paged.total ?? paged.items.length,
        pageNumber: paged.page ?? params.pageNumber ?? 1,
        pageSize: paged.pageSize ?? params.pageSize ?? 20,
      };
    }
  } catch {
    // ignore
  }

  // 3. Thử gọi GET /api/v1/admin/products (Lấy sản phẩm hệ thống)
  try {
    const { data } = await api.get('/admin/products', {
      params: { pageSize: 100, ...params },
      ...buyerRequestConfig,
    });
    const paged = unwrapPagedList(data);
    return {
      ok: true,
      items: paged.items || [],
      total: paged.total ?? (paged.items || []).length,
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

const extractRowVersion = (payload) =>
  payload?.rowVersion ?? payload?.RowVersion ?? null;

const buildIfMatchHeader = (rowVersion, quoted = true) =>
  quoted ? `"${rowVersion}"` : String(rowVersion);

const resolveRowVersion = (result, previousRowVersion, context) => {
  const next = extractRowVersion(result);
  if (!next) {
    console.warn(`[ecommerceProductService] ${context}: response không có rowVersion mới, giữ rowVersion cũ.`);
    return previousRowVersion;
  }
  return next;
};

async function requestWithIfMatch(method, url, { body, rowVersion, quoted = true }) {
  const config = {
    headers: { 'If-Match': buildIfMatchHeader(rowVersion, quoted) },
  };
  if (method === 'post') return api.post(url, body ?? {}, config);
  if (method === 'patch') return api.patch(url, body ?? {}, config);
  throw new Error(`Unsupported method: ${method}`);
}

/**
 * Gọi API có If-Match — thử quoted trước (chuẩn HTTP ETag), fallback unquoted nếu fail.
 */
async function requestWithIfMatchRetry(method, url, { body, rowVersion, context }) {
  if (!rowVersion) {
    throw new Error(`Thiếu rowVersion cho ${context}.`);
  }

  try {
    return await requestWithIfMatch(method, url, { body, rowVersion, quoted: true });
  } catch (error) {
    console.error(
      `[ecommerceProductService] ${context} If-Match (quoted) failed`,
      error?.response?.status,
      error?.response?.data ?? error,
    );

    try {
      const response = await requestWithIfMatch(method, url, { body, rowVersion, quoted: false });
      if (isDev) {
        console.info(`[ecommerceProductService] ${context}: If-Match unquoted thành công.`);
      }
      return response;
    } catch (retryError) {
      console.error(
        `[ecommerceProductService] ${context} If-Match (unquoted) failed`,
        retryError?.response?.status,
        retryError?.response?.data ?? retryError,
      );
      throw retryError;
    }
  }
}

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
  const uniqueSuffix = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
  const skuCode = `DEFAULT-${uniqueSuffix}`;

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
        skuCode,
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
    console.info('[ecommerceProductService] POST /ecommerce/products response', result, {
      inferredStatus: result?.status ?? result?.moderationStatus ?? result?.productStatus,
    });
  }
  const productId = extractProductId(result);
  return { ...result, productId, rowVersion: extractRowVersion(result) };
}

const isAbsoluteHttpsUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    return new URL(value.trim()).protocol === 'https:';
  } catch {
    return false;
  }
};

const extractStorageObjectKey = (response) => {
  const data = getUploadPayload(response);
  if (typeof data === 'string') return data.trim();
  return String(data.key || data.storageObjectKey || '').trim();
};

/**
 * Body POST /ecommerce/products/{id}/images — đúng Swagger:
 * { imageUrl, storageObjectKey, altText, isPrimary, sortOrder }
 */
export function buildAttachProductImagePayload({
  url,
  key,
  imageUrl: imageUrlIn,
  storageObjectKey: storageKeyIn,
  altText = '',
  isPrimary = false,
  isCover,
  sortOrder = 0,
} = {}) {
  const storageObjectKey = String(storageKeyIn || key || '').trim();
  const rawUrl = imageUrlIn ?? url ?? null;
  const imageUrl = rawUrl && isAbsoluteHttpsUrl(rawUrl) ? String(rawUrl).trim() : null;

  if (!storageObjectKey && !imageUrl) {
    throw new Error(
      'Thiếu storageObjectKey hoặc imageUrl HTTPS — kiểm tra response POST /catalog/uploads/product.',
    );
  }

  const payload = {
    altText: String(altText).trim(),
    sortOrder: Number(sortOrder),
    isPrimary: Boolean(isPrimary ?? isCover ?? false),
    storageObjectKey,
  };

  if (imageUrl) {
    payload.imageUrl = imageUrl;
  }

  if (isDev) {
    console.info('[ecommerceProductService] attach image payload', payload);
  }

  return payload;
}

/**
 * Upload ảnh sản phẩm — POST /catalog/uploads/product
 */
export async function uploadProductImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const response = await api.post('/catalog/uploads/product', fd, MULTIPART);
  const rawPayload = getUploadPayload(response);
  const url = extractUploadUrl(response);
  const key = extractStorageObjectKey(response);

  if (isDev) {
    console.info('[ecommerceProductService] POST /catalog/uploads/product response', rawPayload, {
      url,
      key,
    });
  }

  if (!key && !isAbsoluteHttpsUrl(url)) {
    throw new Error('Server không trả về storageObjectKey hoặc imageUrl HTTPS.');
  }
  return { url, key };
}

/**
 * Gắn ảnh vào sản phẩm — POST /ecommerce/products/{productId}/images
 * @returns {{ data: object, rowVersion: string }}
 */
export async function attachProductImage(productId, imageData, currentRowVersion) {
  const path = `/ecommerce/products/${productId}/images`;
  const body = buildAttachProductImagePayload(imageData);
  const { data } = await requestWithIfMatchRetry('post', path, {
    body,
    rowVersion: currentRowVersion,
    context: 'attachProductImage',
  });
  const result = unwrapData(data);
  return {
    data: result,
    rowVersion: resolveRowVersion(result, currentRowVersion, 'attachProductImage'),
  };
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
 * @returns {object} result kèm rowVersion mới nhất (nếu có)
 */
export async function submitProductForReview(productId, currentRowVersion) {
  const path = `/ecommerce/products/${productId}/submit-review`;
  let result;

  if (currentRowVersion) {
    const { data } = await requestWithIfMatchRetry('post', path, {
      body: {},
      rowVersion: currentRowVersion,
      context: 'submitProductForReview',
    });
    result = unwrapData(data);
  } else {
    const { data } = await api.post(path);
    result = unwrapData(data);
  }

  if (isDev) {
    console.info('[ecommerceProductService] POST /ecommerce/products/submit-review response', {
      productId,
      status: result?.status ?? result?.moderationStatus ?? result?.productStatus,
      rowVersion: extractRowVersion(result),
      result,
    });
  }

  return {
    ...result,
    rowVersion: currentRowVersion
      ? resolveRowVersion(result, currentRowVersion, 'submitProductForReview')
      : extractRowVersion(result),
  };
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
export async function updateProductStatus(productId, status, currentRowVersion) {
  const path = `/ecommerce/products/${productId}/status`;
  const body = { status };

  if (currentRowVersion) {
    const { data } = await requestWithIfMatchRetry('patch', path, {
      body,
      rowVersion: currentRowVersion,
      context: 'updateProductStatus',
    });
    const result = unwrapData(data);
    return {
      ...result,
      rowVersion: resolveRowVersion(result, currentRowVersion, 'updateProductStatus'),
    };
  }

  const { data } = await api.patch(path, body);
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
