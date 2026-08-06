import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

/**
 * 1. GET /api/v1/admin/products
 * Trả danh sách sản phẩm toàn hệ thống với bộ lọc quản trị
 */
export async function getAdminProducts(params = {}) {
  const queryParams = {
    sortBy: 'updatedat',
    sortDirection: 'desc',
    pageNumber: 1,
    pageSize: 100,
    ...params,
  };

  try {
    const { data } = await api.get('/admin/products', { params: queryParams });
    const paged = unwrapPagedList(data);

    // Map dữ liệu theo đúng Swagger Schema của Admin API
    const mappedItems = (paged?.items || []).map((p) => {
      const priceText = p.minPrice === p.maxPrice
        ? `${(p.minPrice || 0).toLocaleString('vi-VN')} ₫`
        : `${(p.minPrice || 0).toLocaleString('vi-VN')} ₫ - ${(p.maxPrice || 0).toLocaleString('vi-VN')} ₫`;

      const statusMap = {
        'ACTIVE': 'Hoạt động',
        'PENDING_REVIEW': 'Chờ duyệt',
        'CHANGES_REQUESTED': 'Yêu cầu sửa',
        'REJECTED': 'Từ chối',
        'DRAFT': 'Bản nháp',
        'INACTIVE': 'Tắt',
      };

      return {
        id: p.productId,
        productId: p.productId,
        productCode: p.productCode || p.productId,
        name: p.productName || 'Sản phẩm',
        productName: p.productName || 'Sản phẩm',
        seller: p.sellerName || 'Người bán',
        sellerName: p.sellerName || 'Người bán',
        sellerUserId: p.sellerUserId,
        sellerAvatarUrl: p.sellerAvatarUrl,
        category: p.categoryName || 'Danh mục',
        categoryName: p.categoryName || 'Danh mục',
        categoryId: p.categoryId,
        price: priceText,
        minPrice: p.minPrice ?? 0,
        maxPrice: p.maxPrice ?? 0,
        currency: p.currency || 'VND',
        salesChannel: p.salesChannel || 'ECOMMERCE',
        status: statusMap[p.status] || p.status || 'Hoạt động',
        rawStatus: p.status,
        sellerEligible: p.sellerEligible ?? true,
        catalogVersion: p.catalogVersion ?? 0,
        updatedAtUtc: p.updatedAtUtc,
        quantity: 10,
      };
    });

    return {
      items: mappedItems,
      total: paged.total ?? mappedItems.length,
      pageNumber: paged.pageNumber ?? 1,
      pageSize: paged.pageSize ?? 100,
    };
  } catch (err) {
    // Fallback nếu /admin/products bị lỗi
    try {
      const { data } = await api.get('/products', {
        params: { salesChannel: 'ECOMMERCE', pageSize: 100, ...params },
      });
      const paged = unwrapPagedList(data);
      const mappedItems = (paged?.items || []).map((p) => ({
        id: p.id || p.productId,
        productId: p.id || p.productId,
        productCode: p.productCode || p.id,
        name: p.name || p.productName || 'Sản phẩm',
        seller: p.sellerName || p.seller || 'Người bán',
        category: p.categoryName || p.category || 'Danh mục',
        price: p.price ? `${Number(p.price).toLocaleString('vi-VN')} ₫` : '0 ₫',
        status: p.isActive ? 'Hoạt động' : 'Chờ duyệt',
        quantity: p.stockQuantity ?? 10,
      }));
      return { items: mappedItems, total: paged.total ?? mappedItems.length };
    } catch {
      throw err;
    }
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
  const body = {
    submissionVersion: payload.submissionVersion ?? 0,
    snapshotHash: payload.snapshotHash || '',
    rowVersion: payload.rowVersion || '',
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
  const body = typeof payload === 'string'
    ? {
        reason: payload,
        submissionVersion: 0,
        snapshotHash: '',
        rowVersion: '',
        operationKey: `req-change-${Date.now()}`,
        idempotencyKey: `idemp-${Date.now()}`,
        callerPayloadHash: '',
      }
    : {
        submissionVersion: payload.submissionVersion ?? 0,
        snapshotHash: payload.snapshotHash || '',
        rowVersion: payload.rowVersion || '',
        reason: payload.reason || payload.feedback || 'Yêu cầu người bán chỉnh sửa lại thông tin sản phẩm',
        operationKey: payload.operationKey || `req-change-${Date.now()}`,
        idempotencyKey: payload.idempotencyKey || `idemp-${Date.now()}`,
        callerPayloadHash: payload.callerPayloadHash || '',
        ...payload,
      };
  const { data } = await api.post(`/admin/products/${productId}/request-changes`, body);
  return unwrapData(data);
}

/**
 * 6. POST /api/v1/admin/products/{productId}/reject
 * Từ chối sản phẩm
 */
export async function rejectAdminProduct(productId, payload = {}) {
  const body = typeof payload === 'string'
    ? {
        reason: payload,
        submissionVersion: 0,
        snapshotHash: '',
        rowVersion: '',
        operationKey: `reject-${Date.now()}`,
        idempotencyKey: `idemp-${Date.now()}`,
        callerPayloadHash: '',
      }
    : {
        submissionVersion: payload.submissionVersion ?? 0,
        snapshotHash: payload.snapshotHash || '',
        rowVersion: payload.rowVersion || '',
        reason: payload.reason || 'Từ chối sản phẩm không đạt yêu cầu kiểm duyệt',
        operationKey: payload.operationKey || `reject-${Date.now()}`,
        idempotencyKey: payload.idempotencyKey || `idemp-${Date.now()}`,
        callerPayloadHash: payload.callerPayloadHash || '',
        ...payload,
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
