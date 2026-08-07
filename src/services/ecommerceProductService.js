import api, { BACKEND_BASE_URL } from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';
import { extractUploadKey, normalizeUploadKey } from './uploadResponse';

export { getApiErrorMessage };

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };
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
 * Chỉ hiển thị 100% sản phẩm có Status = 'ACTIVE' thực sự trong CSDL SQL Server
 */
export async function getProducts(filters = {}) {
  const params = normalizeProductFilters(filters);
  logDevRequest('GET', BUYER_LIST_PATH, params);

  // 1. Gọi API Public chính thức GET /api/v1/ecommerce/products (Server C# lọc Status = 'ACTIVE' trong DB)
  try {
    const { data } = await api.get(BUYER_LIST_PATH, { params, ...buyerRequestConfig });
    const paged = unwrapPagedList(data);
    const rawItems = paged?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      return {
        ok: true,
        items: rawItems,
        total: paged.total ?? rawItems.length,
        pageNumber: paged.page ?? params.pageNumber ?? 1,
        pageSize: paged.pageSize ?? params.pageSize ?? 20,
      };
    }
  } catch {
    // ignore
  }

  // 2. Fallback GET /api/v1/products (giới hạn pageSize ≤ 20 tránh 400)
  try {
    const safeParams = { ...params };
    if (!safeParams.pageSize || safeParams.pageSize > 20) safeParams.pageSize = 20;
    const { data } = await api.get('/products', {
      params: safeParams,
      ...buyerRequestConfig,
    });
    const paged = unwrapPagedList(data);
    const rawItems = paged?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      return {
        ok: true,
        items: rawItems,
        total: paged.total ?? rawItems.length,
        pageNumber: paged.page ?? params.pageNumber ?? 1,
        pageSize: paged.pageSize ?? params.pageSize ?? 20,
      };
    }
  } catch (err) {
    logDevError('GET /products fallback', err);
  }

  return {
    ok: true,
    items: [],
    total: 0,
    pageNumber: params.pageNumber ?? 1,
    pageSize: params.pageSize ?? 20,
  };
}

/**
 * Chi tiết sản phẩm — GET /ecommerce/products/{productId}
 * Scope phân chia theo vai trò:
 * - 'public': Người mua công khai xem sản phẩm (mặc định, không bắt buộc token)
 * - 'mine': Seller xem sản phẩm của chính mình (cần user token)
 * - 'all': Admin xem đầy đủ dữ liệu quản trị (cần admin token)
 */
export async function getProductById(productId, scope = 'public') {
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

/** Trang người mua công khai — scope="public", không bắt buộc token */
export const getPublicProductDetail = (productId) => getProductById(productId, 'public');

/** Seller xem sản phẩm của chính mình — scope="mine" */
export const getSellerProductDetail = (productId) => getProductById(productId, 'mine');

/** Admin xem đầy đủ dữ liệu quản trị — scope="all" */
export const getAdminProductDetail = (productId) => getProductById(productId, 'all');

const getUploadPayload = (response) => response?.data?.data ?? response?.data ?? {};

const extractUploadUrl = (response) => {
  const data = getUploadPayload(response);
  if (typeof data === 'string') return data;
  return data.url || data.fileUrl || data.imageUrl || '';
};

const extractProductId = (payload) =>
  payload?.id ?? payload?.productId ?? payload?.data?.id ?? payload?.data?.productId;

const DEFAULT_SALES_CHANNEL = 'ECOMMERCE';
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
  const { data } = await api.post('/ecommerce/products', payload, { skipErrorRedirect: true });
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
  const response = await api.post('/catalog/uploads/product', fd, { ...MULTIPART, skipErrorRedirect: true });
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
  const { data } = await api.post(`/ecommerce/products/${productId}/images`, imageData, { headers, skipErrorRedirect: true });
  return unwrapData(data);
}

/**
 * Tạo SKU — POST /ecommerce/products/{productId}/skus
 */
export async function createProductSku(productId, skuData, rowVersion) {
  const headers = { 'If-Match': rowVersion || '*' };
  const { data } = await api.post(`/ecommerce/products/${productId}/skus`, skuData, { headers, skipErrorRedirect: true });
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
        skipErrorRedirect: true,
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
    const { data } = await api.get(`/ecommerce/products/${productId}/moderation`, { skipErrorRedirect: true });
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

export const resolveImageUrl = (img) => {
  if (!img) return '';
  if (typeof img === 'string') {
    if (img.startsWith('http')) return img;
    return `https://biddoubletk-media.sgp1.digitaloceanspaces.com/${img.replace(/^\//, '')}`;
  }
  const url = img.imageUrl || img.url || img.fileUrl || img.primaryImageUrl || img.coverImageUrl;
  if (url && typeof url === 'string' && url.startsWith('http')) return url;
  const key = img.storageObjectKey || img.imageKey || img.key || url;
  if (key && typeof key === 'string') {
    if (key.startsWith('http')) return key;
    return `https://biddoubletk-media.sgp1.digitaloceanspaces.com/${key.replace(/^\//, '')}`;
  }
  return '';
};

export function extractProductStock(item) {
  if (!item) return 0;

  // 1. Kiểm tra các mảng SKUs / variations / variationRows / productSkus / variants
  const skuArrays = [item.skus, item.productSkus, item.variations, item.variants, item.variationRows];
  for (const arr of skuArrays) {
    if (Array.isArray(arr) && arr.length > 0) {
      let total = 0;
      let found = false;

      arr.forEach((s) => {
        let skuStock =
          s.stockQuantity ??
          s.stock ??
          s.quantity ??
          s.inventoryQuantity ??
          s.availableQuantity;

        if (skuStock == null && s.attributes) {
          if (typeof s.attributes === 'object') {
            skuStock =
              s.attributes.stock ??
              s.attributes.stockQuantity ??
              s.attributes.quantity;
          } else if (typeof s.attributes === 'string') {
            try {
              const parsed = JSON.parse(s.attributes);
              skuStock = parsed?.stock ?? parsed?.stockQuantity ?? parsed?.quantity;
            } catch {
              /* ignore */
            }
          }
        }

        if (skuStock == null && s.attributesJson) {
          try {
            const parsed = JSON.parse(s.attributesJson);
            skuStock = parsed?.stock ?? parsed?.stockQuantity ?? parsed?.quantity;
          } catch {
            /* ignore */
          }
        }

        if (skuStock != null && !isNaN(Number(skuStock))) {
          total += Number(skuStock);
          found = true;
        }
      });

      if (found && total > 0) return total;
    }
  }

  // 2. Kiểm tra thuộc tính trên root (ưu tiên các giá trị > 0)
  const rootCandidates = [
    item.stockQuantity,
    item.stock,
    item.totalStock,
    item.quantity,
    item.availableStock,
    item.inventoryQuantity,
    item.availableQuantity,
    item.details?.stock,
    item.details?.stockQuantity,
    item.details?.quantity,
  ];

  for (const val of rootCandidates) {
    if (val != null && !isNaN(Number(val)) && Number(val) > 0) {
      return Number(val);
    }
  }

  // 3. Fallback tìm từ localStorage ("seller_created_products") theo id / productId / name
  try {
    const localList = JSON.parse(localStorage.getItem('seller_created_products') || '[]');
    const targetId = String(item.id || item.productId || '').trim().toLowerCase();
    const targetName = String(item.name || item.productName || item.title || '').trim().toLowerCase();

    const matched = localList.find((p) => {
      const pid = String(p.id || p.productId || '').trim().toLowerCase();
      const pname = String(p.name || p.productName || p.title || '').trim().toLowerCase();

      const idMatch = pid && targetId && (pid === targetId || pid.includes(targetId) || targetId.includes(pid));
      const nameMatch = pname && targetName && (pname === targetName || pname.includes(targetName) || targetName.includes(pname));

      return idMatch || nameMatch;
    });

    if (matched) {
      if (matched.stock != null && !isNaN(Number(matched.stock)) && Number(matched.stock) > 0) {
        return Number(matched.stock);
      }
      if (matched.stockQuantity != null && !isNaN(Number(matched.stockQuantity)) && Number(matched.stockQuantity) > 0) {
        return Number(matched.stockQuantity);
      }
      if (matched.quantity != null && !isNaN(Number(matched.quantity)) && Number(matched.quantity) > 0) {
        return Number(matched.quantity);
      }
      if (Array.isArray(matched.variationRows) && matched.variationRows.length > 0) {
        const sum = matched.variationRows.reduce((acc, row) => acc + (Number(row.stock || row.quantity) || 0), 0);
        if (sum > 0) return sum;
      }
      if (Array.isArray(matched.skus) && matched.skus.length > 0) {
        const sum = matched.skus.reduce((acc, sku) => {
          const sVal = sku.stock ?? sku.stockQuantity ?? sku.quantity ?? sku.attributes?.stock ?? 0;
          return acc + (Number(sVal) || 0);
        }, 0);
        if (sum > 0) return sum;
      }
    }
  } catch {
    /* ignore */
  }

  // 4. Trả về giá trị root bất kỳ (dù bằng 0)
  for (const val of rootCandidates) {
    if (val != null && !isNaN(Number(val))) {
      return Number(val);
    }
  }

  return 0;
}

export function mapSellerProductToUi(item) {
  if (!item) return null;

  const candidateImages = [];

  if (Array.isArray(item.images) && item.images.length > 0) {
    candidateImages.push(...item.images);
  }
  if (Array.isArray(item.productImages) && item.productImages.length > 0) {
    candidateImages.push(...item.productImages);
  }
  if (Array.isArray(item.product_images) && item.product_images.length > 0) {
    candidateImages.push(...item.product_images);
  }
  if (item.imageUrl) candidateImages.push(item.imageUrl);
  if (item.primaryImageUrl) candidateImages.push(item.primaryImageUrl);
  if (item.coverImageUrl) candidateImages.push(item.coverImageUrl);
  if (item.image) candidateImages.push(item.image);
  if (item.imageKey) candidateImages.push(item.imageKey);
  if (item.storageObjectKey) candidateImages.push(item.storageObjectKey);
  if (item.thumbnail) candidateImages.push(item.thumbnail);
  if (item.picture) candidateImages.push(item.picture);

  if (Array.isArray(item.skus)) {
    item.skus.forEach((s) => {
      if (s.imageUrl) candidateImages.push(s.imageUrl);
      if (s.imageKey) candidateImages.push(s.imageKey);
      if (s.storageObjectKey) candidateImages.push(s.storageObjectKey);
    });
  }

  const images = Array.from(new Set(candidateImages.map(resolveImageUrl).filter(Boolean)));

  const rawStatus = String(item.status || '').toUpperCase();
  const rawMod = String(item.moderationStatus || item.moderation_status || item.reviewStatus || item.approvalStatus || '').toUpperCase();

  let moderationStatus = 'DRAFT';
  if (
    rawMod.includes('REJECT') ||
    rawMod.includes('BLOCK') ||
    rawStatus === 'REJECTED'
  ) {
    moderationStatus = 'REJECTED';
  } else if (
    rawMod.includes('PENDING') ||
    rawMod.includes('AUTO_REVIEW') ||
    rawMod.includes('REVIEW') ||
    rawMod.includes('SUBMIT') ||
    rawStatus === 'PENDING' ||
    rawStatus === 'PENDING_REVIEW'
  ) {
    moderationStatus = 'PENDING_MANUAL_REVIEW';
  } else if (rawMod.includes('APPROV') || rawStatus === 'ACTIVE' || rawStatus === 'APPROVED') {
    moderationStatus = 'APPROVED';
  }

  const stock = extractProductStock(item);

  const price =
    item.price ??
    item.unitPrice ??
    item.sellingPrice ??
    item.minPrice ??
    item.skus?.[0]?.unitPrice ??
    item.skus?.[0]?.price ??
    0;

  const name =
    item.productName ||
    item.name ||
    item.title ||
    item.productCode ||
    'Sản phẩm';

  return {
    id: item.id ?? item.productId,
    name,
    productName: name,
    category: item.categoryName || item.categoryId || item.category || '',
    brand: item.brand || item.brandName || '',
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
