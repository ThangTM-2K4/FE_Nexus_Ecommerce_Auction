import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

const mapAdminProductItem = (p) => {
  const priceText = p.minPrice === p.maxPrice
    ? `${Number(p.minPrice || p.price || 0).toLocaleString('vi-VN')} ₫`
    : `${Number(p.minPrice || 0).toLocaleString('vi-VN')} ₫ - ${Number(p.maxPrice || 0).toLocaleString('vi-VN')} ₫`;

  const statusMap = {
    'ACTIVE': 'Hoạt động',
    'PENDING_REVIEW': 'Chờ duyệt',
    'CHANGES_REQUESTED': 'Yêu cầu sửa',
    'REJECTED': 'Từ chối',
    'DRAFT': 'Bản nháp',
    'INACTIVE': 'Tắt',
  };

  const id = p.productId || p.id;
  const name = p.productName || p.name || p.title || 'Sản phẩm';
  const seller = p.sellerName || p.seller || p.shopName || 'LE NGUYEN ANH KIET';
  const category = p.categoryName || p.category || 'Điện Thoại & Phụ Kiện';

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
    status: statusMap[p.status] || p.status || (p.isActive ? 'Hoạt động' : 'Bản nháp'),
    rawStatus: p.status,
    sellerEligible: p.sellerEligible ?? true,
    catalogVersion: p.catalogVersion ?? 0,
    updatedAtUtc: p.updatedAtUtc,
    quantity: p.stockQuantity ?? p.stock ?? 10,
    stock: p.stockQuantity ?? p.stock ?? 10,
  };
};

/**
 * 1. GET /api/v1/admin/products (với fallback tự động)
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
 * 2. GET /api/v1/admin/products/review-queue
 * Trả hàng đợi kiểm duyệt sản phẩm dành cho Staff/Admin
 */
export async function getAdminProductReviewQueue(params = {}) {
  const queryParams = {
    pageNumber: 1,
    pageSize: 100,
    ...params,
  };
  const { data } = await api.get('/admin/products/review-queue', { params: queryParams });
  return unwrapPagedList(data);
}

/**
 * 3. GET /api/v1/admin/products/{productId}/review-detail
 * Trả chi tiết kiểm duyệt sản phẩm dành cho Staff/Admin
 */
export async function getAdminProductReviewDetail(productId) {
  const { data } = await api.get(`/admin/products/${productId}/review-detail`);
  return unwrapData(data);
}

/**
 * 4. POST /api/v1/admin/products/{productId}/approve
 * Phê duyệt sản phẩm sau khi kiểm duyệt thủ công
 */
export async function approveAdminProduct(productId, payload = {}) {
  let detail = null;
  try {
    detail = await getAdminProductReviewDetail(productId);
  } catch {
    // ignore
  }

  const subVer = payload.submissionVersion || detail?.submissionVersion || 1;
  const snapHash = payload.snapshotHash || detail?.productSnapshotHash || 'approved_hash';
  const rowVer = payload.rowVersion || detail?.productRowVersion || detail?.rowVersion || '';

  const body = {
    submissionVersion: subVer > 0 ? subVer : 1,
    snapshotHash: snapHash,
    rowVersion: rowVer,
    reason: payload.reason || 'Phê duyệt sản phẩm bởi Admin',
    operationKey: payload.operationKey || `approve-${Date.now()}`,
    idempotencyKey: payload.idempotencyKey || `idemp-${Date.now()}`,
    callerPayloadHash: payload.callerPayloadHash || '',
    ...payload,
  };

  const { data } = await api.post(`/admin/products/${productId}/approve`, body);
  return unwrapData(data);
}

/**
 * 5. POST /api/v1/admin/products/{productId}/request-changes
 * Yêu cầu người bán chỉnh sửa lại thông tin sản phẩm
 */
export async function requestProductChanges(productId, payload = {}) {
  let detail = null;
  try {
    detail = await getAdminProductReviewDetail(productId);
  } catch {
    // ignore
  }

  const pObj = typeof payload === 'object' ? payload : {};
  const subVer = pObj.submissionVersion || detail?.submissionVersion || 1;
  const snapHash = pObj.snapshotHash || detail?.productSnapshotHash || 'changes_requested_hash';
  const rowVer = pObj.rowVersion || detail?.productRowVersion || detail?.rowVersion || '';
  const reasonText = typeof payload === 'string' ? payload : (pObj.reason || pObj.feedback || 'Yêu cầu người bán chỉnh sửa lại thông tin sản phẩm');

  const body = {
    submissionVersion: subVer > 0 ? subVer : 1,
    snapshotHash: snapHash,
    rowVersion: rowVer,
    reason: reasonText,
    operationKey: pObj.operationKey || `req-change-${Date.now()}`,
    idempotencyKey: pObj.idempotencyKey || `idemp-${Date.now()}`,
    callerPayloadHash: pObj.callerPayloadHash || '',
    ...pObj,
  };

  const { data } = await api.post(`/admin/products/${productId}/request-changes`, body);
  return unwrapData(data);
}

/**
 * 6. POST /api/v1/admin/products/{productId}/reject
 * Từ chối sản phẩm
 */
export async function rejectAdminProduct(productId, payload = {}) {
  let detail = null;
  try {
    detail = await getAdminProductReviewDetail(productId);
  } catch {
    // ignore
  }

  const pObj = typeof payload === 'object' ? payload : {};
  const subVer = pObj.submissionVersion || detail?.submissionVersion || 1;
  const snapHash = pObj.snapshotHash || detail?.productSnapshotHash || 'rejected_hash';
  const rowVer = pObj.rowVersion || detail?.productRowVersion || detail?.rowVersion || '';
  const reasonText = typeof payload === 'string' ? payload : (pObj.reason || 'Từ chối sản phẩm không đạt yêu cầu kiểm duyệt');

  const body = {
    submissionVersion: subVer > 0 ? subVer : 1,
    snapshotHash: snapHash,
    rowVersion: rowVer,
    reason: reasonText,
    operationKey: pObj.operationKey || `reject-${Date.now()}`,
    idempotencyKey: pObj.idempotencyKey || `idemp-${Date.now()}`,
    callerPayloadHash: pObj.callerPayloadHash || '',
    ...pObj,
  };

  const { data } = await api.post(`/admin/products/${productId}/reject`, body);
  return unwrapData(data);
}

/**
 * 7. POST /api/v1/admin/products/{productId}/resolve-legacy-channel
 * Chuyển đổi kênh bán legacy BOTH thành ECOMMERCE hoặc AUCTION dành cho Admin
 */
export async function resolveLegacyChannel(productId, { targetChannel = 'ECOMMERCE', rowVersion = '', reason = 'Chuyển đổi kênh bán' } = {}) {
  const body = { targetChannel, rowVersion, reason };
  const { data } = await api.post(`/admin/products/${productId}/resolve-legacy-channel`, body);
  return unwrapData(data);
}
