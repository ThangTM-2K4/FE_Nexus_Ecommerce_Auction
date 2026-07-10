import api from '../config/api';
import { mockDelay } from './mockDelay';
import {
  sellerApplications as mockApplications,
  flaggedAuctions as mockFlaggedAuctions,
  openDisputes as mockDisputes,
} from '../data/staffMockData';

const applicationKey = (userId) => `mockSellerApplication_${userId}`;

const readLocalApplication = (userId) => {
  const raw = localStorage.getItem(applicationKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString('vi-VN');
};

// Response backend bọc { data, message }. Phân biệt data:null với không bọc
// (xem giải thích ở sellerService).
const unwrap = (res) => {
  const body = res?.data;
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body ?? null;
};

// Response của GET /admin/sellers có thể là mảng thẳng, hoặc bọc trong
// { items | content | data | results }. Chuẩn hoá về mảng.
const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  return (
    payload.items ??
    payload.content ??
    payload.data ??
    payload.results ??
    payload.sellers ??
    []
  );
};

const sellerTypeLabel = (type) => {
  const t = String(type ?? '').toLowerCase();
  if (t === 'business' || t === 'doanh nghiệp') return 'Doanh nghiệp';
  if (t === 'personal' || t === 'individual' || t === 'cá nhân') return 'Cá nhân';
  return type || '—';
};

// Backend trả status kiểu PascalCase ("Approved", "Submitted"...). Quy về 3
// trạng thái UI dùng: PENDING / APPROVED / REJECTED.
const normalizeStatus = (s) => {
  const u = String(s ?? '').trim().toUpperCase();
  if (['APPROVED', 'ACTIVE', 'ACCEPTED'].includes(u)) return 'APPROVED';
  if (['REJECTED', 'DECLINED', 'DENIED'].includes(u)) return 'REJECTED';
  if (
    ['PENDING', 'SUBMITTED', 'UNDERREVIEW', 'UNDER_REVIEW', 'INREVIEW', 'WAITING', 'PROCESSING'].includes(u)
  ) {
    return 'PENDING';
  }
  return u || 'PENDING';
};

const mapLocalApplication = (app) => ({
  applicationId: app.applicationId,
  userId: app.userId,
  fullName: app.fullName || app.shopName || 'Người dùng',
  email: app.email || '—',
  phone: app.phone || app.phoneNumber || '—',
  shopName: app.shopName || '—',
  category: app.category || app.businessCategory || '—',
  submittedAt: fmtDate(app.submittedAt),
  reviewedAt: fmtDate(app.reviewedAt),
  status: app.status,
  rejectionReason: app.rejectionReason || '',
  adminNote: app.adminNote || '',
  documents: app.documents || ['CMND/CCCD'],
  cccdNumber: app.cccdNumber || '—',
  cccdAddress: app.cccdAddress || '—',
  frontImageUrl: app.frontImageUrl || '',
  backImageUrl: app.backImageUrl || '',
  taxCode: app.taxCode || '—',
  businessType: app.businessType || '—',
  pickupAddress: app.pickupAddress || '—',
  bankName: app.bankName || '—',
  accountNumber: app.accountNumber || '—',
  accountHolder: app.accountHolder || '—',
  businessLicense: app.businessLicense || '',
  source: 'local',
});

// Chuẩn hoá 1 seller từ API admin.
//  - raw:    item trong list GET /admin/sellers (chỉ có id, userId, sellerType, status, submittedAt)
//  - detail: GET /admin/sellers/{id}  (tên shop, MST, địa chỉ, ngân hàng...)
//  - user:   GET /admin/users/{userId} (email, tên, SĐT, CCCD)
// Thiếu tới đâu bù bằng localStorage (nếu cùng máy) tới đó.
const mapApiApplication = (raw, detail = null, user = null) => {
  const d = { ...raw, ...(detail || {}) };
  const sellerId = d.id ?? d.sellerId ?? raw.id ?? null;
  const userId = d.userId ?? raw.userId ?? sellerId;
  const status = normalizeStatus(d.status);
  const local = userId ? readLocalApplication(userId) : null;

  const businessLicense = d.businessLicenseUrl ?? d.businessLicense ?? '';
  const documents = [
    'CCCD mặt trước',
    'CCCD mặt sau',
    businessLicense ? 'Giấy phép kinh doanh' : 'Giấy tờ định danh',
  ];

  const userFullName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    '';

  return {
    applicationId: sellerId ?? raw.applicationId ?? `SA-${userId}`,
    sellerId,
    userId,
    fullName: userFullName || d.bankAccountHolder || d.businessName || local?.fullName || 'Người dùng',
    email: user?.email || d.email || local?.email || '—',
    phone: user?.phoneNumber || user?.phone || d.phone || local?.phone || '—',
    shopName: d.businessName || local?.shopName || '—',
    category: sellerTypeLabel(d.sellerType || local?.businessType),
    submittedAt: fmtDate(d.submittedAt || raw.submittedAt || d.createdAt || local?.submittedAt),
    reviewedAt: fmtDate(d.reviewedAt || d.updatedAt || d.reviewedDate),
    status,
    rejectionReason: d.rejectionReason || d.rejectReason || d.reason || '',
    adminNote: d.adminNote || d.note || '',
    documents: local?.documents || documents,
    cccdNumber: user?.identityNumber || local?.cccdNumber || '—',
    cccdAddress: user?.address || local?.cccdAddress || '—',
    frontImageUrl: user?.frontImageUrl || local?.frontImageUrl || '',
    backImageUrl: user?.backImageUrl || local?.backImageUrl || '',
    taxCode: d.taxCode || local?.taxCode || '—',
    businessType: d.sellerType || local?.businessType || '—',
    pickupAddress: d.address || local?.pickupAddress || '—',
    bankName: d.bankName || local?.bankName || '—',
    accountNumber: d.bankAccountNumber || local?.accountNumber || '—',
    accountHolder: d.bankAccountHolder || local?.accountHolder || '—',
    businessLicense,
    source: 'api',
  };
};

const unwrapDetail = unwrap;

// Gọi chi tiết seller + thông tin user để làm giàu 1 đơn. Lỗi từng call thì
// bỏ qua (trả null) để không chặn cả danh sách.
const enrichApplication = async (item) => {
  const sellerId = item.id ?? item.sellerId ?? null;
  const userId = item.userId ?? null;
  const [detail, user] = await Promise.all([
    sellerId
      ? api.get(`admin/sellers/${sellerId}`).then(unwrapDetail).catch(() => null)
      : null,
    userId
      ? api.get(`admin/users/${userId}`).then(unwrapDetail).catch(() => null)
      : null,
  ]);
  return mapApiApplication(item, detail, user);
};

const setLocalApplicationStatus = (userId, status, extra = {}) => {
  const app = readLocalApplication(userId);
  if (!app) return null;
  const updated = { ...app, status, reviewedAt: new Date().toISOString(), ...extra };
  localStorage.setItem(applicationKey(userId), JSON.stringify(updated));
  return updated;
};

const sortPendingFirst = (list) =>
  [...list].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return 0;
  });

// Danh sách dự phòng từ localStorage + mock khi API lỗi/không có dữ liệu.
const getLocalSellerApplications = () => {
  const localApps = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith('mockSellerApplication_')) continue;
    const app = readLocalApplication(key.replace('mockSellerApplication_', ''));
    if (app) localApps.push(mapLocalApplication(app));
  }

  const merged = [...localApps];
  mockApplications
    .filter((a) => a.status === 'PENDING')
    .forEach((mock) => {
      if (!merged.some((a) => a.applicationId === mock.applicationId)) {
        merged.push({ ...mapLocalApplication(mock), source: 'mock' });
      }
    });

  return sortPendingFirst(merged);
};

// GET /api/v1/admin/sellers — lấy TẤT CẢ đơn để staff xem cả lịch sử.
// Rơi về localStorage nếu API lỗi để không chặn luồng làm việc.
export const getPendingSellerApplications = async () => {
  try {
    const res = await api.get('admin/sellers', { params: { page: 1, pageSize: 100 } });
    const items = extractList(unwrap(res));

    // Với mỗi đơn, gọi thêm chi tiết seller + thông tin user để hiển thị đủ.
    const list = await Promise.all(items.map(enrichApplication));

    // Bổ sung đơn cục bộ chưa xuất hiện trên API (ví dụ nộp khi offline).
    const local = getLocalSellerApplications();
    const seenUsers = new Set(list.map((a) => a.userId));
    local.forEach((a) => {
      if (a.source !== 'mock' && !seenUsers.has(a.userId)) list.push(a);
    });

    return sortPendingFirst(list);
  } catch (err) {
    // API lỗi (thường 401/403 do thiếu quyền staff, hoặc mạng) → dùng dữ liệu
    // localStorage cùng máy làm dự phòng. Log để tiện chẩn đoán tại sao đơn
    // từ seller không hiện lên phía staff.
    console.warn(
      '[staff] GET admin/sellers thất bại, dùng dữ liệu localStorage dự phòng:',
      err?.response?.status,
      err?.response?.data ?? err?.message
    );
    return getLocalSellerApplications();
  }
};

// PUT /api/v1/admin/sellers/{id}/approve
export const approveSellerApplication = async (app) => {
  const sellerId = app?.sellerId ?? app?.applicationId ?? app;
  const userId = app?.userId ?? app;

  if (app?.source === 'api' && sellerId) {
    const res = await api.put(`admin/sellers/${sellerId}/approve`);
    setLocalApplicationStatus(userId, 'APPROVED');
    return unwrap(res) ?? { sellerId, status: 'APPROVED' };
  }

  // Đơn cục bộ/mock: cập nhật localStorage.
  await mockDelay(600);
  setLocalApplicationStatus(userId, 'APPROVED');
  return { userId, status: 'APPROVED' };
};

// PUT /api/v1/admin/sellers/{id}/reject  body: { reason }
export const rejectSellerApplication = async (app, reason, adminNote) => {
  const sellerId = app?.sellerId ?? app?.applicationId ?? app;
  const userId = app?.userId ?? app;

  if (app?.source === 'api' && sellerId) {
    const res = await api.put(`admin/sellers/${sellerId}/reject`, { reason });
    setLocalApplicationStatus(userId, 'REJECTED', {
      rejectionReason: reason,
      adminNote: adminNote || '',
    });
    return unwrap(res) ?? { sellerId, status: 'REJECTED' };
  }

  await mockDelay(600);
  setLocalApplicationStatus(userId, 'REJECTED', {
    rejectionReason: reason,
    adminNote: adminNote || '',
  });
  return { userId, status: 'REJECTED' };
};

const PRODUCTS_PREFIX = 'mockSellerProducts_';

export const getPendingProducts = async () => {
  await mockDelay();
  const pending = [];

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PRODUCTS_PREFIX)) continue;

    const userId = key.replace(PRODUCTS_PREFIX, '');
    const raw = localStorage.getItem(key);
    let products = [];
    try {
      products = JSON.parse(raw) || [];
    } catch {
      products = [];
    }

    products
      .filter((p) => p.status === 'PENDING')
      .forEach((p) => pending.push({ ...p, userId }));
  }

  return pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const approveProduct = async (userId, productId) => {
  await mockDelay(600);
  const { updateProductStatus } = await import('./productService');
  return updateProductStatus(userId, productId, 'APPROVED');
};

export const rejectProduct = async (userId, productId, reason) => {
  await mockDelay(600);
  const { updateProductStatus } = await import('./productService');
  return updateProductStatus(userId, productId, 'REJECTED', reason);
};

export const getFlaggedAuctions = async () => {
  await mockDelay();
  return mockFlaggedAuctions;
};

export const getOpenDisputes = async () => {
  await mockDelay();
  return mockDisputes;
};

export const resolveAuctionFlag = async (auctionId, action, note) => {
  await mockDelay(600);
  return { auctionId, action, note, resolvedAt: new Date().toISOString() };
};

export const updateDisputeStatus = async (disputeId, status, note) => {
  await mockDelay(600);
  return { disputeId, status, note, updatedAt: new Date().toISOString() };
};
