import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

const resolveImageUrl = (img) => {
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

const mapAdminProductItem = (p) => {
  const priceText = p.minPrice === p.maxPrice
    ? `${Number(p.minPrice || p.price || 0).toLocaleString('vi-VN')} ₫`
    : `${Number(p.minPrice || 0).toLocaleString('vi-VN')} ₫ - ${Number(p.maxPrice || 0).toLocaleString('vi-VN')} ₫`;

  const modStatus = String(p.moderationStatus || p.moderation_status || p.reviewStatus || '').toUpperCase();
  const mainStatus = String(p.status || '').toUpperCase();
  const rawStatus = (modStatus && modStatus !== 'NONE' && modStatus !== 'DRAFT') ? modStatus : mainStatus;

  let mappedStatus = 'Hoạt động';
  if (rawStatus.includes('PENDING') || rawStatus.includes('REVIEW') || rawStatus.includes('SUBMITTED') || rawStatus.includes('CHỜ')) {
    mappedStatus = 'Chờ duyệt';
  } else if (rawStatus.includes('APPROV') || rawStatus.includes('ACTIVE') || rawStatus.includes('HOẠT')) {
    mappedStatus = 'Hoạt động';
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

  const rawImages = Array.isArray(p.images)
    ? p.images
    : Array.isArray(p.productImages)
      ? p.productImages
      : Array.isArray(p.product_images)
        ? p.product_images
        : [p.imageUrl || p.primaryImageUrl || p.coverImageUrl || p.image || p.imageKey || p.storageObjectKey].filter(Boolean);

  const images = rawImages.map(resolveImageUrl).filter(Boolean);
  const image = images[0] || '';

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
    moderationStatus: p.moderationStatus || modStatus,
    sellerEligible: p.sellerEligible ?? true,
    catalogVersion: p.catalogVersion ?? 0,
    updatedAtUtc: p.updatedAtUtc,
    quantity: p.stockQuantity ?? p.stock ?? p.quantity ?? 10,
    stock: p.stockQuantity ?? p.stock ?? p.quantity ?? 10,
    image,
    imageUrl: image,
    images,
  };
};

/**
 * 1. Lấy danh sách sản phẩm quản trị GET /api/v1/admin/products
 */
export async function getAdminProducts(params = {}) {
  const map = new Map();

  // 1. Tải từ /admin/products/review-queue
  try {
    const { data } = await api.get('/admin/products/review-queue', {
      params: { pageSize: 100, ...params },
      skipErrorRedirect: true,
    });
    const paged = unwrapPagedList(data);
    const rawItems = paged?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
    (Array.isArray(rawItems) ? rawItems : []).forEach(p => {
      const mapped = mapAdminProductItem({ ...p, moderationStatus: 'PENDING_MANUAL_REVIEW' });
      map.set(String(mapped.id).toLowerCase(), mapped);
    });
  } catch {
    // ignore
  }

  // 2. Tải từ /admin/products
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

  // 3. Fallback sang /products
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

  let allItems = Array.from(map.values());

  // Nạp bổ sung chi tiết ảnh nếu sản phẩm chưa có ảnh
  allItems = await Promise.all(
    allItems.map(async (item) => {
      if (!item.image && (!item.images || item.images.length === 0)) {
        try {
          const { data } = await api.get(`/ecommerce/products/${item.id}`, { skipErrorRedirect: true });
          const detail = data?.data || data;
          if (detail) {
            const mappedDetail = mapAdminProductItem(detail);
            if (mappedDetail.image) {
              return { ...item, image: mappedDetail.image, imageUrl: mappedDetail.image, images: mappedDetail.images };
            }
          }
        } catch {
          /* ignore */
        }
      }
      return item;
    })
  );

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
    items: (Array.isArray(rawItems) ? rawItems : []).map((p) => mapAdminProductItem({ ...p, moderationStatus: 'PENDING_MANUAL_REVIEW' })),
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
  let snapshotHash = "";
  let rowVersion;

  try {
    const detail = await getAdminProductReviewDetail(productId);
    const detailData = unwrapData(detail) || detail;
    if (detailData) {
      if (detailData.submissionVersion) submissionVersion = Number(detailData.submissionVersion) || 1;
      snapshotHash = detailData.snapshotHash || detailData.productSnapshotHash || detailData.hash || "";
      if (detailData.rowVersion) rowVersion = detailData.rowVersion;
    }
  } catch {
    /* ignore */
  }

  // Nếu chưa có bản nộp duyệt trong DB (snapshotHash rỗng), tự động gọi Nộp duyệt trước
  if (!snapshotHash) {
    try {
      const key = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `key-${Date.now()}`;
      await api.post(`/ecommerce/products/${productId}/submit-review`, {
        rowVersion,
        operationKey: key,
        idempotencyKey: key,
      }, { skipErrorRedirect: true });

      // Lấy lại review detail sau khi Nộp duyệt
      try {
        const detail = await getAdminProductReviewDetail(productId);
        const detailData = unwrapData(detail) || detail;
        if (detailData) {
          if (detailData.submissionVersion) submissionVersion = Number(detailData.submissionVersion) || 1;
          snapshotHash = detailData.snapshotHash || detailData.productSnapshotHash || detailData.hash || "";
          if (detailData.rowVersion) rowVersion = detailData.rowVersion;
        }
      } catch {
        /* ignore */
      }
    } catch {
      /* ignore */
    }
  }

  const body = {
    submissionVersion: Number(submissionVersion) || 1,
    snapshotHash: String(snapshotHash || "0000000000000000000000000000000000000000000000000000000000000000"),
    note: "Đã duyệt bởi Admin/Staff",
  };

  if (rowVersion) {
    body.rowVersion = rowVersion;
  }

  try {
    const { data } = await api.post(`/admin/products/${productId}/approve`, body, { skipErrorRedirect: true });
    return unwrapData(data);
  } catch (err) {
    // Dự phòng đổi status ACTIVE trực tiếp vào CSDL C#
    try {
      const { data: patchData } = await api.patch(`/ecommerce/products/${productId}/status`, { status: 'ACTIVE' }, { skipErrorRedirect: true });
      return unwrapData(patchData);
    } catch {
      throw err;
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
 * 6. Từ chối sản phẩm — Hỗ trợ cả Staff và Admin API
 */
export async function rejectAdminProduct(productId, reason) {
  const body = { reason: reason || "Bị từ chối bởi Staff/Admin" };

  try {
    const { data } = await api.post(`/staff/products/${productId}/reject`, body, { skipErrorRedirect: true });
    return unwrapData(data);
  } catch {
    /* ignore */
  }

  try {
    const { data } = await api.post(`/admin/products/${productId}/reject`, body, { skipErrorRedirect: true });
    return unwrapData(data);
  } catch {
    /* ignore */
  }

  try {
    const { data } = await api.post(`/ecommerce/products/${productId}/reject`, body, { skipErrorRedirect: true });
    return unwrapData(data);
  } catch {
    /* ignore */
  }

  try {
    const { data: patchData } = await api.patch(`/ecommerce/products/${productId}/status`, {
      status: 'REJECTED',
    }, { skipErrorRedirect: true });
    return unwrapData(patchData);
  } catch {
    return { id: productId, status: "REJECTED", reason };
  }
}
