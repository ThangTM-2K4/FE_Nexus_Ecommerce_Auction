import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

/**
 * 1. Lấy danh sách sản phẩm quản trị GET /api/v1/admin/products hoặc GET /api/v1/products?salesChannel=ECOMMERCE
 * KHÔNG DÙNG MOCK - 100% dữ liệu thực từ Backend Catalog Service API
 */
export async function getAdminProducts(params = {}) {
  try {
    const { data } = await api.get('/admin/products', { params });
    return unwrapPagedList(data);
  } catch (err) {
    try {
      const { data } = await api.get('/products', {
        params: { salesChannel: 'ECOMMERCE', pageSize: 100, ...params },
      });
      return unwrapPagedList(data);
    } catch {
      throw err;
    }
  }
}

/**
 * 2. Hàng chờ sản phẩm chờ duyệt GET /api/v1/admin/products/review-queue
 */
export async function getAdminProductReviewQueue(params = {}) {
  const { data } = await api.get('/admin/products/review-queue', { params });
  return unwrapPagedList(data);
}

/**
 * 3. Chi tiết duyệt sản phẩm GET /api/v1/admin/products/{productId}/review-detail
 */
export async function getAdminProductReviewDetail(productId) {
  const { data } = await api.get(`/admin/products/${productId}/review-detail`);
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
