import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';
import { mockProducts } from '../data/adminEntities';

export { getApiErrorMessage };

/**
 * Lấy danh sách sản phẩm quản trị /api/v1/admin/products (fallback sang mock)
 */
export async function getAdminProducts(params = {}) {
  try {
    const { data } = await api.get('/admin/products', { params });
    const paged = unwrapPagedList(data);
    return paged;
  } catch {
    return { items: mockProducts, total: mockProducts.length };
  }
}

/**
 * Hàng chờ sản phẩm chờ duyệt /api/v1/admin/products/review-queue
 */
export async function getAdminProductReviewQueue(params = {}) {
  try {
    const { data } = await api.get('/admin/products/review-queue', { params });
    return unwrapPagedList(data);
  } catch {
    const pending = mockProducts.filter((p) => p.status === 'Chờ duyệt');
    return { items: pending, total: pending.length };
  }
}

/**
 * Chi tiết duyệt sản phẩm /api/v1/admin/products/{productId}/review-detail
 */
export async function getAdminProductReviewDetail(productId) {
  try {
    const { data } = await api.get(`/admin/products/${productId}/review-detail`);
    return unwrapData(data);
  } catch {
    return mockProducts.find((p) => p.id === productId) || null;
  }
}

/**
 * Phê duyệt sản phẩm /api/v1/admin/products/{productId}/approve
 */
export async function approveAdminProduct(productId) {
  const { data } = await api.post(`/admin/products/${productId}/approve`);
  return unwrapData(data);
}

/**
 * Yêu cầu sửa đổi sản phẩm /api/v1/admin/products/{productId}/request-changes
 */
export async function requestProductChanges(productId, feedback) {
  const { data } = await api.post(`/admin/products/${productId}/request-changes`, { feedback });
  return unwrapData(data);
}

/**
 * Từ chối sản phẩm /api/v1/admin/products/{productId}/reject
 */
export async function rejectAdminProduct(productId, reason) {
  const { data } = await api.post(`/admin/products/${productId}/reject`, { reason });
  return unwrapData(data);
}
