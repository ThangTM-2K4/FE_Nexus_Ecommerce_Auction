import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';
import { extractProductStock } from './ecommerceProductService';

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

/** Tạo UUID dùng cho operationKey / idempotencyKey */
const generateKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `key-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

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
    status: p.status || (rawStatus.includes('APPROV') || rawStatus.includes('ACTIVE') ? 'ACTIVE' : rawStatus),
    statusLabel: mappedStatus,
    rawStatus: p.status,
    moderationStatus: p.moderationStatus || modStatus,
    sellerEligible: p.sellerEligible ?? true,
    catalogVersion: p.catalogVersion ?? 0,
    updatedAtUtc: p.updatedAtUtc,
    quantity: extractProductStock(p),
    stock: extractProductStock(p),
    image,
    imageUrl: image,
    images,
  };
};

/**
 * 1. Lấy danh sách sản phẩm quản trị
 *    Chỉ gọi endpoint thực sự tồn tại: /admin/products/review-queue, /admin/products
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

  // 2. Tải từ /admin/products (endpoint duy nhất tồn tại cho admin listing)
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

  // 3. Fallback sang /products nếu không lấy được gì
  if (map.size === 0) {
    try {
      const { data } = await api.get('/products', {
        params: { pageSize: 100, salesChannel: 'ECOMMERCE', ...params },
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

  // Nạp bổ sung chi tiết ảnh & SKUs/tồn kho nếu sản phẩm chưa có ảnh hoặc tồn kho bằng 0
  allItems = await Promise.all(
    allItems.map(async (item) => {
      let enriched = { ...item };
      let currentStock = extractProductStock(enriched);

      if (!enriched.image || currentStock === 0) {
        try {
          const { data } = await api.get(`/admin/products/${item.id}/review-detail`, { skipErrorRedirect: true });
          const detail = unwrapData(data) || data?.data || data;
          if (detail) {
            const rawImgs = Array.isArray(detail.images)
              ? detail.images
              : Array.isArray(detail.productImages)
                ? detail.productImages
                : [detail.imageUrl || detail.primaryImageUrl || detail.coverImageUrl || detail.storageObjectKey].filter(Boolean);
            const mappedImgs = rawImgs.map((img) => typeof img === "string" ? img : img?.imageUrl || img?.storageObjectKey).filter(Boolean);

            if (mappedImgs.length > 0 && !enriched.image) {
              enriched.image = mappedImgs[0];
              enriched.imageUrl = mappedImgs[0];
              enriched.images = mappedImgs;
            }

            if (Array.isArray(detail.skus) && detail.skus.length > 0) {
              enriched.skus = detail.skus;
            }
            if (detail.stock != null && Number(detail.stock) > 0) enriched.stock = Number(detail.stock);
            if (detail.quantity != null && Number(detail.quantity) > 0) enriched.quantity = Number(detail.quantity);
            if (detail.stockQuantity != null && Number(detail.stockQuantity) > 0) enriched.stockQuantity = Number(detail.stockQuantity);

            const detailStock = extractProductStock(detail);
            if (detailStock > 0) {
              enriched.stock = detailStock;
              enriched.quantity = detailStock;
            }
          }
        } catch {
          /* ignore */
        }
      }

      // Gọi tiếp API /ecommerce/products/{id}?scope=management nếu tồn kho vẫn bằng 0
      if (extractProductStock(enriched) === 0) {
        try {
          const { data } = await api.get(`/ecommerce/products/${item.id}?scope=management`, { skipErrorRedirect: true });
          const detail = unwrapData(data) || data?.data || data;
          if (detail) {
            if (Array.isArray(detail.skus) && detail.skus.length > 0) {
              enriched.skus = detail.skus;
            }
            if (detail.stock != null && Number(detail.stock) > 0) enriched.stock = Number(detail.stock);
            if (detail.quantity != null && Number(detail.quantity) > 0) enriched.quantity = Number(detail.quantity);

            const detailStock = extractProductStock(detail);
            if (detailStock > 0) {
              enriched.stock = detailStock;
              enriched.quantity = detailStock;
            }
          }
        } catch {
          /* ignore */
        }
      }

      const finalStock = extractProductStock(enriched);
      return {
        ...enriched,
        stock: finalStock,
        quantity: finalStock,
      };
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
 *
 * Backend ApproveModerationApiRequest yêu cầu:
 *   submissionVersion (int), snapshotHash (string), reason? (string),
 *   operationKey (string), idempotencyKey (string), callerPayloadHash? (string)
 */
export async function approveAdminProduct(productId) {
  // Bước 1: Đảm bảo nộp duyệt trước (nếu sản phẩm đang ở DRAFT/CREATED)
  try {
    const submitKey = generateKey();
    await api.post(`/ecommerce/products/${productId}/submit-review`, {
      operationKey: submitKey,
      idempotencyKey: submitKey,
    }, {
      headers: {
        'X-Operation-Key': submitKey,
        'X-Idempotency-Key': submitKey,
      },
      skipErrorRedirect: true,
    });
  } catch {
    /* ignore - sản phẩm có thể đã ở PENDING_MANUAL_REVIEW */
  }

  // Bước 2: Lấy review-detail để có submissionVersion & snapshotHash chính xác
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

  // Bước 3: Gửi approve đúng API contract — dùng "reason" (không phải "note")
  const opKey = generateKey();
  const body = {
    submissionVersion: Number(submissionVersion) || 1,
    snapshotHash: String(snapshotHash || "0000000000000000000000000000000000000000000000000000000000000000"),
    reason: "Đã duyệt bởi Admin/Staff",
    operationKey: opKey,
    idempotencyKey: opKey,
  };

  if (rowVersion) {
    body.rowVersion = rowVersion;
  }

  // Gọi endpoint đúng: /admin/products/{id}/approve (KHÔNG gọi /staff/products — không tồn tại)
  const { data } = await api.post(`/admin/products/${productId}/approve`, body, {
    headers: {
      'X-Operation-Key': opKey,
      'X-Idempotency-Key': opKey,
    },
    skipErrorRedirect: true,
  });
  return unwrapData(data);
}

/**
 * 5. Yêu cầu sửa đổi sản phẩm POST /api/v1/admin/products/{productId}/request-changes
 *
 * Backend ModerationActionApiRequest yêu cầu:
 *   submissionVersion (int), snapshotHash (string), reason (string),
 *   operationKey (string), idempotencyKey (string)
 */
export async function requestProductChanges(productId, feedback) {
  let submissionVersion = 1;
  let snapshotHash = "";
  let rowVersion;

  try {
    const detail = await getAdminProductReviewDetail(productId);
    const detailData = unwrapData(detail) || detail;
    if (detailData) {
      if (detailData.submissionVersion) submissionVersion = Number(detailData.submissionVersion) || 1;
      snapshotHash = detailData.snapshotHash || detailData.productSnapshotHash || "";
      if (detailData.rowVersion) rowVersion = detailData.rowVersion;
    }
  } catch {
    /* ignore */
  }

  const opKey = generateKey();
  const body = {
    submissionVersion: Number(submissionVersion) || 1,
    snapshotHash: String(snapshotHash || "0000000000000000000000000000000000000000000000000000000000000000"),
    reason: feedback || "Yêu cầu chỉnh sửa bởi Admin/Staff",
    operationKey: opKey,
    idempotencyKey: opKey,
  };

  if (rowVersion) {
    body.rowVersion = rowVersion;
  }

  const { data } = await api.post(`/admin/products/${productId}/request-changes`, body, {
    headers: {
      'X-Operation-Key': opKey,
      'X-Idempotency-Key': opKey,
    },
    skipErrorRedirect: true,
  });
  return unwrapData(data);
}

/**
 * 6. Từ chối sản phẩm POST /api/v1/admin/products/{productId}/reject
 *
 * Backend ModerationActionApiRequest yêu cầu:
 *   submissionVersion (int), snapshotHash (string), reason (string),
 *   operationKey (string), idempotencyKey (string)
 */
export async function rejectAdminProduct(productId, reason) {
  // Lấy review-detail để có submissionVersion & snapshotHash chính xác
  let submissionVersion = 1;
  let snapshotHash = "";
  let rowVersion;

  try {
    const detail = await getAdminProductReviewDetail(productId);
    const detailData = unwrapData(detail) || detail;
    if (detailData) {
      if (detailData.submissionVersion) submissionVersion = Number(detailData.submissionVersion) || 1;
      snapshotHash = detailData.snapshotHash || detailData.productSnapshotHash || "";
      if (detailData.rowVersion) rowVersion = detailData.rowVersion;
    }
  } catch {
    /* ignore */
  }

  const opKey = generateKey();
  const body = {
    submissionVersion: Number(submissionVersion) || 1,
    snapshotHash: String(snapshotHash || "0000000000000000000000000000000000000000000000000000000000000000"),
    reason: reason || "Bị từ chối bởi Staff/Admin",
    operationKey: opKey,
    idempotencyKey: opKey,
  };

  if (rowVersion) {
    body.rowVersion = rowVersion;
  }

  // Gọi endpoint đúng: /admin/products/{id}/reject (KHÔNG gọi /staff/products — không tồn tại)
  const { data } = await api.post(`/admin/products/${productId}/reject`, body, {
    headers: {
      'X-Operation-Key': opKey,
      'X-Idempotency-Key': opKey,
    },
    skipErrorRedirect: true,
  });
  return unwrapData(data);
}
