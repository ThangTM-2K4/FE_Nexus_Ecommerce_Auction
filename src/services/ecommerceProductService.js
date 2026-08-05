import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';
import { extractUploadKey, normalizeUploadKey } from './uploadResponse';

export { getApiErrorMessage };

const MULTIPART = { headers: { 'Content-Type': undefined } };

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
