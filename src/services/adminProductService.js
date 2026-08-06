import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

const mapAdminProductItem = (p) => {
  const priceText = p.minPrice === p.maxPrice
    ? `${Number(p.minPrice || p.price || 0).toLocaleString('vi-VN')} ₫`
    : `${Number(p.minPrice || 0).toLocaleString('vi-VN')} ₫ - ${Number(p.maxPrice || 0).toLocaleString('vi-VN')} ₫`;

  const rawStatus = String(p.status || p.moderationStatus || '').toUpperCase();
  let mappedStatus = 'Hoạt động';
  if (rawStatus.includes('PENDING') || rawStatus.includes('REVIEW') || rawStatus.includes('SUBMITTED') || rawStatus.includes('CHỜ')) {
    mappedStatus = 'Chờ duyệt';
  } else if (rawStatus.includes('DRAFT') || rawStatus.includes('NHÁP')) {
    mappedStatus = 'Bản nháp';
  } else if (rawStatus.includes('REJECT') || rawStatus.includes('TỪ CHỐI')) {
    mappedStatus = 'Từ chối';
  } else if (rawStatus.includes('CHANGE') || rawStatus.includes('SỬA')) {
    mappedStatus = 'Yêu cầu sửa';
  } else if (rawStatus.includes('INACTIVE') || rawStatus.includes('TẮT') || rawStatus.includes('ẨN')) {
    mappedStatus = 'Tắt';
  }

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
    status: mappedStatus,
    rawStatus: p.status,
    sellerEligible: p.sellerEligible ?? true,
    catalogVersion: p.catalogVersion ?? 0,
    updatedAtUtc: p.updatedAtUtc,
    quantity: p.stockQuantity ?? p.stock ?? p.quantity ?? 10,
    stock: p.stockQuantity ?? p.stock ?? p.quantity ?? 10,
  };
};

/**
 * 1. Lấy danh sách sản phẩm quản trị GET /api/v1/admin/products
 */
export async function getAdminProducts(params = {}) {
  const map = new Map();

  // 1. Tải từ localStorage
  try {
    const localList = JSON.parse(localStorage.getItem('seller_created_products') || '[]');
    localList.forEach(item => {
      if (item && (item.id || item.productId)) {
        const mapped = mapAdminProductItem(item);
        map.set(String(mapped.id).toLowerCase(), mapped);
      }
    });
  } catch {
    // ignore
  }

  // 2. Tải từ /admin/products/review-queue
  try {
    const { data } = await api.get('/admin/products/review-queue', {
      params: { pageSize: 100, ...params },
      skipErrorRedirect: true,
    });
    const paged = unwrapPagedList(data);
    const rawItems = paged?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
    (Array.isArray(rawItems) ? rawItems : []).forEach(p => {
      const mapped = mapAdminProductItem({ ...p, status: 'PENDING_REVIEW' });
      map.set(String(mapped.id).toLowerCase(), mapped);
    });
  } catch {
    // ignore
  }

  // 3. Tải từ /admin/products
  try {
    const { data } = await api.get('/admin/products', {
      params: { pageSize: 100, ...params },
      skipErrorRedirect: true,
    });
    const paged = unwrapPagedList(data);
    const rawItems = paged?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
    (Array.isArray(rawItems) ? rawItems : []).forEach(p => {
      const mapped = mapAdminProductItem(p);
      map.set(String(mapped.id).toLowerCase(), mapped);
    });
  } catch {
    // ignore
  }

  // 4. Fallback sang /products
  if (map.size === 0) {
    try {
      const { data } = await api.get('/products', {
        params: { pageSize: 100, ...params },
        skipErrorRedirect: true,
      });
      const paged = unwrapPagedList(data);
      const rawItems = paged?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
      (Array.isArray(rawItems) ? rawItems : []).forEach(p => {
        const mapped = mapAdminProductItem(p);
        map.set(String(mapped.id).toLowerCase(), mapped);
      });
    } catch {
      // ignore
    }
  }

  const allItems = Array.from(map.values());
  return {
    items: allItems,
    total: allItems.length,
    pageNumber: 1,
    pageSize: 100,
  };
}

/**
 * 2. Hàng chờ sản phẩm chờ duyệt GET /api/v1/admin/products/review-queue
 */
export async function getAdminProductReviewQueue(params = {}) {
  const { data } = await api.get('/admin/products/review-queue', { params, skipErrorRedirect: true });
  const paged = unwrapPagedList(data);
  const rawItems = paged?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
  return {
    ...paged,
    items: (Array.isArray(rawItems) ? rawItems : []).map(mapAdminProductItem),
  };
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
  let submissionVersion = 1;
  let snapshotHash = "HASH";
  let rowVersion;

  try {
    const detail = await getAdminProductReviewDetail(productId);
    if (detail) {
      if (detail.submissionVersion) submissionVersion = detail.submissionVersion;
      if (detail.snapshotHash) snapshotHash = detail.snapshotHash;
      if (detail.rowVersion) rowVersion = detail.rowVersion;
    }
  } catch {
    // ignore
  }

  const body = {
    submissionVersion,
    snapshotHash,
    note: "Đã duyệt bởi Admin",
    ...(rowVersion ? { rowVersion } : {}),
  };

  try {
    const { data } = await api.post(`/admin/products/${productId}/approve`, body, { skipErrorRedirect: true });
    return unwrapData(data);
  } catch (err) {
    try {
      const { data } = await api.put(`/management/products/${productId}/approve`, body, { skipErrorRedirect: true });
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
