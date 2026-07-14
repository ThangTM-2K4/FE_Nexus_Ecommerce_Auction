import api from '../config/api';
import { mockDelay } from './mockDelay';
import {
  sellerApplications as mockApplications,
  flaggedAuctions as mockFlaggedAuctions,
  openDisputes as mockDisputes,
  identityVerificationQueue as mockIdentityQueue,
  monitoredOrders as mockMonitoredOrders,
  violationReports as mockViolationReports,
  staffNotificationFeed as mockNotificationFeed,
} from '../data/staffMockData';
import {
  sellerDirectory as mockSellerDirectory,
  platformUsers as mockPlatformUsers,
  activityLog as mockActivityLog,
  platformRoles as mockPlatformRoles,
  staffShipments as mockStaffShipments,
  shippingZones as mockShippingZones,
  systemEventLogs as mockSystemEventLogs,
  systemHealthStatus as mockSystemHealth,
} from '../data/staffDirectoryData';
import {
  mockProducts,
  mockCategories,
  mockOrders,
  mockAuctions,
  mockBids,
  mockRolePermissions,
} from '../data/adminEntities';
import { getAdminAuditLogs, getAdminAuditLogById, mapAuditLog } from './adminAuditService';

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

// GET /api/v1/management/sellers-applications
export const getPendingSellerApplications = async () => {
  try {
    const res = await api.get('management/sellers-applications', { params: { page: 1, pageSize: 100 } });
    const items = extractList(unwrap(res));

    const list = await Promise.all(items.map(enrichApplication));

    const local = getLocalSellerApplications();
    const seenUsers = new Set(list.map((a) => a.userId));
    local.forEach((a) => {
      if (a.source !== 'mock' && !seenUsers.has(a.userId)) list.push(a);
    });

    return sortPendingFirst(list);
  } catch (err) {
    console.warn(
      '[staff] GET management/sellers-applications thất bại, dùng dữ liệu localStorage dự phòng:',
      err?.response?.status,
      err?.response?.data ?? err?.message
    );
    return getLocalSellerApplications();
  }
};

// PUT /api/v1/management/sellers-applications/{id}/approve
export const approveSellerApplication = async (app) => {
  const sellerId = app?.sellerId ?? app?.applicationId ?? app;
  const userId = app?.userId ?? app;

  if (app?.source === 'api' && sellerId) {
    const res = await api.put(`management/sellers-applications/${sellerId}/approve`);
    setLocalApplicationStatus(userId, 'APPROVED');
    return unwrap(res) ?? { sellerId, status: 'APPROVED' };
  }

  await mockDelay(600);
  setLocalApplicationStatus(userId, 'APPROVED');
  return { userId, status: 'APPROVED' };
};

// PUT /api/v1/management/sellers-applications/{id}/reject  body: { reason }
// RejectSellerRequest chỉ nhận { reason } — field note không có trong swagger BE
export const rejectSellerApplication = async (app, reason) => {
  const sellerId = app?.sellerId ?? app?.applicationId ?? app;
  const userId = app?.userId ?? app;

  if (app?.source === 'api' && sellerId) {
    const res = await api.put(`management/sellers-applications/${sellerId}/reject`, { reason });
    setLocalApplicationStatus(userId, 'REJECTED', { rejectionReason: reason });
    return unwrap(res) ?? { sellerId, status: 'REJECTED' };
  }

  await mockDelay(600);
  setLocalApplicationStatus(userId, 'REJECTED', { rejectionReason: reason });
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

/* ═══════════ XÁC MINH CCCD ═══════════
 * Hàng chờ gộp 2 nguồn:
 *  - Hồ sơ thật: localStorage profile_<userId> có cccdNumber (người dùng nộp ở
 *    trang "Thông tin cá nhân"). Duyệt/từ chối ghi ngược identityStatus vào
 *    profile để trang cá nhân của user hiện đúng trạng thái.
 *  - Hồ sơ mock: identityVerificationQueue. Quyết định lưu vào
 *    staffIdentityDecisions để không hiện lại sau khi xử lý.
 */

const IDENTITY_DECISIONS_KEY = 'staffIdentityDecisions';

const readIdentityDecisions = () => {
  try {
    return JSON.parse(localStorage.getItem(IDENTITY_DECISIONS_KEY)) || {};
  } catch {
    return {};
  }
};

const writeIdentityDecision = (id, decision) => {
  const all = readIdentityDecisions();
  all[id] = { ...decision, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(IDENTITY_DECISIONS_KEY, JSON.stringify(all));
  } catch {
    /* localStorage đầy → bỏ qua */
  }
};

const readUserProfileRecord = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(`profile_${userId}`)) || null;
  } catch {
    return null;
  }
};

export const getIdentityVerifications = async () => {
  await mockDelay();
  const decisions = readIdentityDecisions();
  const entries = [];

  // Hồ sơ thật từ profile_* trên máy
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith('profile_')) continue;
    const userId = key.replace('profile_', '');
    const p = readUserProfileRecord(userId);
    if (!p?.cccdNumber) continue;

    const status =
      p.identityStatus === 'APPROVED' || p.identityStatus === 'VERIFIED'
        ? 'APPROVED'
        : p.identityStatus === 'REJECTED'
          ? 'REJECTED'
          : 'PENDING';

    entries.push({
      id: `IDV-${userId}`,
      userId,
      source: 'profile',
      fullName: p.cccdFullName || p.fullName || 'Người dùng',
      cccdNumber: p.cccdNumber,
      cccdAddress: p.cccdAddress || '—',
      email: p.email || '—',
      phone: p.phone || '—',
      frontImageUrl: p.cccdFrontImageUrl || '',
      backImageUrl: p.cccdBackImageUrl || '',
      submittedAt: '—',
      status,
      rejectReason: p.identityRejectReason || decisions[`IDV-${userId}`]?.reason || null,
    });
  }

  // Hồ sơ mock (đã quyết định thì mang trạng thái từ decisions)
  mockIdentityQueue.forEach((item) => {
    const decision = decisions[item.id];
    entries.push({
      ...item,
      status: decision?.status || 'PENDING',
      rejectReason: decision?.reason || null,
    });
  });

  // Chờ duyệt lên đầu
  return entries.sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return 0;
  });
};

export const approveIdentityVerification = async (entry) => {
  await mockDelay(500);
  if (entry.source === 'profile' && entry.userId) {
    const p = readUserProfileRecord(entry.userId);
    if (p) {
      const updated = {
        ...p,
        identityStatus: 'APPROVED',
        isNationalIdVerified: true,
        identityRejectReason: null,
      };
      localStorage.setItem(`profile_${entry.userId}`, JSON.stringify(updated));
    }
  }
  writeIdentityDecision(entry.id, { status: 'APPROVED' });
  return { id: entry.id, status: 'APPROVED' };
};

export const rejectIdentityVerification = async (entry, reason, note) => {
  await mockDelay(500);
  if (entry.source === 'profile' && entry.userId) {
    const p = readUserProfileRecord(entry.userId);
    if (p) {
      const updated = {
        ...p,
        identityStatus: 'REJECTED',
        isNationalIdVerified: false,
        identityRejectReason: reason,
      };
      localStorage.setItem(`profile_${entry.userId}`, JSON.stringify(updated));
    }
  }
  writeIdentityDecision(entry.id, { status: 'REJECTED', reason, note: note || '' });
  return { id: entry.id, status: 'REJECTED', reason };
};

/* ═══════════ GIÁM SÁT ĐƠN HÀNG ═══════════ */

export const getMonitoredOrders = async () => {
  await mockDelay();
  return mockMonitoredOrders.map((o) => ({ ...o }));
};

// action: 'checked' (đã kiểm tra, gỡ cờ) | 'escalate' (chuyển thành khiếu nại)
export const resolveOrderFlag = async (orderId, action, note) => {
  await mockDelay(400);
  return { orderId, action, note: note || '', resolvedAt: new Date().toISOString() };
};

/* ═══════════ BÁO CÁO VI PHẠM ═══════════ */

const REPORT_DECISIONS_KEY = 'staffReportDecisions';

const readReportDecisions = () => {
  try {
    return JSON.parse(localStorage.getItem(REPORT_DECISIONS_KEY)) || {};
  } catch {
    return {};
  }
};

export const getViolationReports = async () => {
  await mockDelay();
  const decisions = readReportDecisions();
  return mockViolationReports.map((r) => {
    const decision = decisions[r.id];
    return {
      ...r,
      status: decision ? 'RESOLVED' : 'OPEN',
      resolution: decision?.action || null,
      resolvedAt: decision?.decidedAt || null,
    };
  });
};

// action: 'remove-content' | 'warn-seller' | 'dismiss'
export const resolveViolationReport = async (reportId, action) => {
  await mockDelay(400);
  const all = readReportDecisions();
  all[reportId] = { action, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(REPORT_DECISIONS_KEY, JSON.stringify(all));
  } catch {
    /* bỏ qua */
  }
  return { reportId, action };
};

/* ═══════════ THÔNG BÁO NỘI BỘ ═══════════ */

const NOTIF_READ_KEY = 'staffNotifRead';

const readNotifReadIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIF_READ_KEY)) || []);
  } catch {
    return new Set();
  }
};

const writeNotifReadIds = (ids) => {
  try {
    localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...ids]));
  } catch {
    /* bỏ qua */
  }
};

export const getStaffNotifications = async () => {
  await mockDelay(200);
  const readIds = readNotifReadIds();
  return mockNotificationFeed.map((n) => ({ ...n, unread: !readIds.has(n.id) }));
};

export const markNotificationRead = async (id) => {
  const readIds = readNotifReadIds();
  readIds.add(id);
  writeNotifReadIds(readIds);
  return { id };
};

export const markAllNotificationsRead = async () => {
  writeNotifReadIds(new Set(mockNotificationFeed.map((n) => n.id)));
  return { count: mockNotificationFeed.length };
};

/* ═══════════ THÔNG TIN NGƯỜI BÁN (danh bạ seller) ═══════════
 * Gộp seller mock + seller thật trên máy (mockSellerApplication_* đã duyệt),
 * kèm sản phẩm đang bán (mockSellerProducts_*).
 */

const readLocalProducts = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(`mockSellerProducts_${userId}`)) || [];
  } catch {
    return [];
  }
};

// Chuyển 1 đơn seller local (đã duyệt) thành bản ghi danh bạ.
const localApplicationToSeller = (userId, app) => {
  const products = readLocalProducts(userId);
  const revenue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.sold) || 0), 0);
  return {
    id: `LOCAL-${userId}`,
    userId,
    shopName: app.shopName || `${app.fullName || "Shop"} Store`,
    ownerName: app.fullName || "Người bán",
    email: app.email || "—",
    phone: app.phone || "—",
    category: app.businessType === "business" ? "Doanh nghiệp" : "Cá nhân",
    businessType: app.businessType === "business" ? "Doanh nghiệp" : "Cá nhân",
    cccdNumber: app.cccdNumber || "—",
    cccdVerified: normalizeStatus(app.status) === "APPROVED",
    taxCode: app.taxCode || "—",
    address: app.pickupAddress || app.cccdAddress || "—",
    bankName: app.bankName || "—",
    accountNumber: app.accountNumber || "—",
    accountHolder: app.accountHolder || "—",
    status: normalizeStatus(app.status),
    joinedAt: fmtDate(app.submittedAt),
    rating: 0,
    reviewCount: 0,
    totalOrders: products.reduce((sum, p) => sum + (Number(p.sold) || 0), 0),
    revenue,
    frontImageUrl: app.frontImageUrl || "",
    backImageUrl: app.backImageUrl || "",
    products: products.map((p) => ({
      id: p.id,
      name: p.name || p.title || "Sản phẩm",
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      sold: Number(p.sold) || 0,
      status: normalizeStatus(p.status),
      category: p.category || "—",
      image: p.image || (Array.isArray(p.images) ? p.images[0] : "") || "",
    })),
    source: "local",
  };
};

export const getSellerDirectory = async () => {
  await mockDelay();
  const sellers = mockSellerDirectory.map((s) => ({ ...s, source: "mock" }));
  const seenUsers = new Set(sellers.map((s) => s.userId));

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith('mockSellerApplication_')) continue;
    const userId = key.replace('mockSellerApplication_', '');
    if (seenUsers.has(userId)) continue;
    const app = readLocalApplication(userId);
    if (!app) continue;
    if (normalizeStatus(app.status) !== 'APPROVED') continue; // chỉ seller đã duyệt
    sellers.push(localApplicationToSeller(userId, app));
    seenUsers.add(userId);
  }

  return sellers;
};

export const getSellerDetail = async (sellerId) => {
  const all = await getSellerDirectory();
  return all.find((s) => s.id === sellerId || s.userId === sellerId) || null;
};

// Đổi trạng thái seller (tạm khoá / mở lại) — mock, lưu quyết định local.
export const setSellerStatus = async (userId, status) => {
  await mockDelay(400);
  return { userId, status };
};

/* ═══════════ QUẢN LÝ NGƯỜI DÙNG ═══════════ */

const USER_STATUS_KEY = 'staffUserStatusOverrides';

const readUserOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_STATUS_KEY)) || {};
  } catch {
    return {};
  }
};

export const getPlatformUsers = async () => {
  await mockDelay();
  const overrides = readUserOverrides();
  return mockPlatformUsers.map((u) => ({ ...u, status: overrides[u.id] || u.status }));
};

export const getPlatformUserDetail = async (userId) => {
  await mockDelay(200);
  const users = await getPlatformUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  return {
    ...user,
    address: user.address || "—",
    reputation: user.reputation ?? 4.2,
    walletBalance: user.walletBalance ?? 0,
    auctionWins: user.auctionWins ?? 0,
    recentOrders: user.recentOrders ?? [],
  };
};

/* ═══════════ TRA CỨU CHỈ XEM (Privileges A–J) ═══════════ */

export const getStaffRoles = async () => {
  await mockDelay(200);
  return mockPlatformRoles.map((r) => ({ ...r }));
};

export const getStaffRolePermissions = async () => {
  await mockDelay(200);
  return mockRolePermissions.map((r) => ({ ...r }));
};

export const getStaffProducts = async () => {
  await mockDelay(200);
  return mockProducts.map((p) => ({ ...p }));
};

export const getStaffProductDetail = async (productId) => {
  await mockDelay(150);
  return mockProducts.find((p) => p.id === productId) || null;
};

export const getStaffCategories = async () => {
  await mockDelay(200);
  return mockCategories.map((c) => ({ ...c }));
};

export const getStaffOrders = async () => {
  await mockDelay(200);
  return mockOrders.map((o) => ({ ...o }));
};

export const getStaffOrderDetail = async (orderId) => {
  await mockDelay(150);
  const order = mockOrders.find((o) => o.id === orderId);
  if (!order) return null;
  return {
    ...order,
    items: order.items || [{ name: order.product || "Sản phẩm", qty: 1, price: order.total }],
    timeline: order.timeline || [
      { at: order.createdAt, event: "Đơn hàng được tạo" },
      { at: order.createdAt, event: `Trạng thái: ${order.status}` },
    ],
  };
};

export const getStaffAuctions = async () => {
  await mockDelay(200);
  return mockAuctions.map((a) => ({ ...a }));
};

export const getStaffAuctionDetail = async (auctionId) => {
  await mockDelay(150);
  const auction = mockAuctions.find((a) => a.id === auctionId);
  if (!auction) return null;
  const bids = mockBids.filter((b) => b.auction === auctionId);
  return { ...auction, bids };
};

export const getStaffBidHistory = async (auctionId) => {
  await mockDelay(150);
  if (auctionId) return mockBids.filter((b) => b.auction === auctionId);
  return mockBids.map((b) => ({ ...b }));
};

export const getStaffShipments = async () => {
  await mockDelay(200);
  return mockStaffShipments.map((s) => ({ ...s }));
};

export const getShippingQuote = async ({ zoneId, weightKg = 1 }) => {
  await mockDelay(300);
  const zone = mockShippingZones.find((z) => z.id === zoneId);
  if (!zone) return null;
  const weightFee = Math.max(0, (weightKg - 1)) * 5000;
  return {
    zone: zone.name,
    baseFee: zone.baseFee,
    weightFee,
    totalFee: zone.baseFee + weightFee,
    estimatedDays: zone.days,
  };
};

export const getStaffShippingZones = async () => {
  await mockDelay(100);
  return mockShippingZones.map((z) => ({ ...z }));
};

// Chuẩn hoá 1 bản ghi audit-log (từ adminAuditService.mapAuditLog) về đúng
// shape trang Event Log đang dùng (actorName, at, detail...).
const auditLogToEvent = (log) => {
  const raw = log._raw ?? {};
  return {
    id: log.id,
    action: log.action ?? '—',
    actor: log.actor,
    actorName: log.actor,
    entityType: log.entityType ?? '—',
    entityId: log.entityId ?? '—',
    detail: raw.detail ?? raw.description ?? raw.message ?? log.action ?? '—',
    at: log.time ?? '—',
    ip: log.ip ?? '—',
    oldValue: log.oldValue ?? null,
    newValue: log.newValue ?? null,
    source: 'api',
  };
};

// Event Log ưu tiên API thật /admin/audit-logs; rơi về mock khi server chưa
// triển khai endpoint hoặc thiếu quyền (401/403/404).
export const getSystemEventLogs = async () => {
  try {
    const { items } = await getAdminAuditLogs({ page: 1, pageSize: 100 });
    if (Array.isArray(items) && items.length) return items.map(auditLogToEvent);
    throw new Error('empty');
  } catch (err) {
    console.warn(
      '[staff] GET admin/audit-logs thất bại/không có dữ liệu, dùng mock Event Log:',
      err?.response?.status ?? err?.message
    );
    await mockDelay(200);
    return mockSystemEventLogs.map((e) => ({ ...e, source: 'mock' }));
  }
};

export const getSystemEventLogDetail = async (eventId) => {
  // ID audit thật là số → thử lấy chi tiết từ API trước.
  if (eventId != null && /^\d+$/.test(String(eventId))) {
    try {
      const full = await getAdminAuditLogById(eventId);
      if (full) return auditLogToEvent(mapAuditLog(full));
    } catch {
      /* rơi về mock bên dưới */
    }
  }
  await mockDelay(150);
  return mockSystemEventLogs.find((e) => e.id === eventId) || null;
};

export const getSystemHealth = async () => {
  await mockDelay(300);
  return {
    ...mockSystemHealth,
    checkedAt: new Date().toLocaleString('vi-VN'),
  };
};

/* ═══════════ NHẬT KÝ HOẠT ĐỘNG ═══════════ */

export const getActivityLog = async () => {
  await mockDelay(200);
  return mockActivityLog.map((l) => ({ ...l }));
};
