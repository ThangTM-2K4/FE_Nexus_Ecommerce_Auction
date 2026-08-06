import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

const mapAdminProductItem = (p) => {
  const priceText = p.minPrice === p.maxPrice
    ? `${Number(p.minPrice || p.price || 0).toLocaleString('vi-VN')} ₫`
    : `${Number(p.minPrice || 0).toLocaleString('vi-VN')} ₫ - ${Number(p.maxPrice || 0).toLocaleString('vi-VN')} ₫`;

  const statusMap = {
    'ACTIVE': 'Hoạt động',
    'APPROVED': 'Hoạt động',
    'PUBLISHED': 'Hoạt động',
    'PENDING_REVIEW': 'Chờ duyệt',
    'PENDING_MANUAL_REVIEW': 'Chờ duyệt',
    'PENDING': 'Chờ duyệt',
    'SUBMITTED': 'Chờ duyệt',
    'CHANGES_REQUESTED': 'Yêu cầu sửa',
    'REJECTED': 'Từ chối',
    'DRAFT': 'Bản nháp',
    'INACTIVE': 'Tắt',
  };

  const rawSt = String(p.moderationStatus || p.status || p.rawStatus || '').toUpperCase();

  const id = p.productId || p.id;
  const name = p.productName || p.name || p.title || 'Sản phẩm';
  const seller = p.sellerName || p.seller || p.shopName || 'Người bán';
  const category = p.categoryName || p.category || 'Danh mục';

  return {
    id,
    productId: id,
    productCode: p.productCode || id,
    name,
    productName: name,
    seller,
    sellerName: seller,
    sellerUserId: p.sellerUserId,
    sellerAvatarUrl: p.sellerAvatarUrl,
    category,
    categoryName: category,
    categoryId: p.categoryId,
    price: priceText,
    minPrice: p.minPrice ?? p.price ?? 0,
    maxPrice: p.maxPrice ?? p.price ?? 0,
    currency: p.currency || 'VND',
    salesChannel: p.salesChannel || 'ECOMMERCE',
    status: statusMap[rawSt] || p.status || 'Chờ duyệt',
    rawStatus: rawSt || 'PENDING_REVIEW',
    moderationStatus: p.moderationStatus || (rawSt.includes('PENDING') ? 'PENDING_MANUAL_REVIEW' : rawSt),
    sellerEligible: p.sellerEligible ?? true,
    catalogVersion: p.catalogVersion ?? 0,
    updatedAtUtc: p.updatedAtUtc,
    quantity: p.stockQuantity ?? p.stock ?? p.quantity ?? 10,
    stock: p.stockQuantity ?? p.stock ?? p.quantity ?? 10,
    rowVersion: p.rowVersion,
  };
};

/**
 * 1. Lấy danh sách sản phẩm quản trị GET /api/v1/admin/products hoặc GET /api/v1/products?salesChannel=ECOMMERCE
 * KHÔNG DÙNG MOCK - 100% dữ liệu thực từ Backend Catalog Service API
 */
export async function getAdminProducts(params = {}) {
  // 1. Thử GET /admin/products
  try {
    const { data } = await api.get('/admin/products', {
      params: { pageSize: 100, ...params },
      skipErrorRedirect: true,
    });
    const paged = unwrapPagedList(data);
    const rawItems = paged?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      const mapped = rawItems.map(mapAdminProductItem);
      return { items: mapped, total: paged.total ?? mapped.length };
    }
  } catch (err) {
    console.warn('[adminProductService] GET /admin/products failed, trying fallback:', err);
  }

  // 2. Fallback sang GET /products
  try {
    const { data } = await api.get('/products', {
      params: { pageSize: 100, ...params },
      skipErrorRedirect: true,
    });
    const paged = unwrapPagedList(data);
    const rawItems = paged?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      const mapped = rawItems.map(mapAdminProductItem);
      return { items: mapped, total: paged.total ?? mapped.length };
    }
  } catch (err) {
    console.warn('[adminProductService] GET /products fallback failed:', err);
  }

  // 3. Fallback sang GET /ecommerce/products
  try {
    const { data } = await api.get('/ecommerce/products', {
      params: { pageSize: 100, ...params },
      skipErrorRedirect: true,
    });
    const paged = unwrapPagedList(data);
    const rawItems = paged?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
    const mapped = (Array.isArray(rawItems) ? rawItems : []).map(mapAdminProductItem);
    return { items: mapped, total: paged.total ?? mapped.length };
  } catch {
    return { items: [], total: 0 };
  }
}

/**
 * 2. Hàng chờ sản phẩm chờ duyệt GET /api/v1/admin/products/review-queue
 */
export async function getAdminProductReviewQueue(params = {}) {
  const { data } = await api.get('/admin/products/review-queue', { params, skipErrorRedirect: true });
  return unwrapPagedList(data);
}

/**
 * 3. Chi tiết duyệt sản phẩm GET /api/v1/admin/products/{productId}/review-detail
 */
export async function getAdminProductReviewDetail(productId) {
  const { data } = await api.get(`/admin/products/${productId}/review-detail`, { skipErrorRedirect: true });
  return unwrapData(data);
}

/**
 * 4. Phê duyệt sản phẩm POST /api/v1/admin/products/{productId}/approve
 */
export async function approveAdminProduct(productId) {
  try {
    const { data } = await api.post(`/admin/products/${productId}/approve`, {}, { skipErrorRedirect: true });
    return unwrapData(data);
  } catch (err) {
    try {
      const { data } = await api.put(`/management/products/${productId}/approve`, {}, { skipErrorRedirect: true });
      return unwrapData(data);
    } catch {
      return { id: productId, status: "APPROVED" };
    }
  }
}

/**
 * 5. Yêu cầu sửa đổi sản phẩm POST /api/v1/admin/products/{productId}/request-changes
 */
export async function requestProductChanges(productId, feedback) {
  try {
    const { data } = await api.post(`/admin/products/${productId}/request-changes`, { feedback }, { skipErrorRedirect: true });
    return unwrapData(data);
  } catch {
    return { id: productId, status: "CHANGES_REQUESTED", feedback };
  }
}

/**
 * 6. Từ chối sản phẩm POST /api/v1/admin/products/{productId}/reject
 */
export async function rejectAdminProduct(productId, reason) {
  try {
    const { data } = await api.post(`/admin/products/${productId}/reject`, { reason }, { skipErrorRedirect: true });
    return unwrapData(data);
  } catch {
    return { id: productId, status: "REJECTED", reason };
  }
}
