import api from '../config/api';
import { mockDelay } from './mockDelay';
import { safeSetItem } from '../utils/safeSetItem';

const shopKey = (userId) => `mockSellerShopProfile_${userId}`;

const unwrap = (res) => {
  const body = res?.data;
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body ?? null;
};

const defaultProfile = (user) => ({
  shopName: user?.fullName ? `${user.fullName}'s Shop` : '',
  logo: null,
  cover: null,
  description: '',
  taxCode: '',
  businessAddress: '',
  businessType: 'individual',
  identityNumber: '',
  businessLicense: '',
  identityUpdatedAt: null,
});

// Đọc đơn đăng ký người bán đã lưu (lúc nộp) để tiền điền hồ sơ Shop sau khi
// được duyệt — người bán không phải nhập lại tên shop, MST, địa chỉ...
const readSellerApplication = (userId) => {
  try {
    const raw = localStorage.getItem(`mockSellerApplication_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const fromApplication = (app) => {
  if (!app) return {};
  const filled = {};
  if (app.shopName) filled.shopName = app.shopName;
  if (app.taxCode) filled.taxCode = app.taxCode;
  if (app.pickupAddress) filled.businessAddress = app.pickupAddress;
  if (app.businessType) filled.businessType = app.businessType === 'business' ? 'company' : 'individual';
  if (app.cccdNumber) filled.identityNumber = app.cccdNumber;
  if (app.businessLicense) filled.businessLicense = app.businessLicense;
  return filled;
};

// Hồ sơ seller thật từ GET /sellers/me — nguồn chính khi đơn được đăng ký/duyệt
// qua API (bản ghi local có thể không tồn tại trên máy này).
const fromApiSeller = (seller) => {
  if (!seller) return {};
  const filled = {};
  if (seller.businessName) filled.shopName = seller.businessName;
  if (seller.taxCode) filled.taxCode = seller.taxCode;
  if (seller.address) filled.businessAddress = seller.address;
  if (seller.sellerType) {
    filled.businessType =
      String(seller.sellerType).toLowerCase() === 'business' ? 'company' : 'individual';
  }
  if (seller.identityNumber) filled.identityNumber = seller.identityNumber;
  if (seller.businessLicenseUrl) filled.businessLicense = seller.businessLicenseUrl;
  return filled;
};

// CCCD người dùng cập nhật ở trang "Thông tin cá nhân" (profile_<userId>) —
// dùng làm định danh chủ shop nếu các nguồn trên chưa có.
const fromUserProfile = (userId) => {
  try {
    const raw = localStorage.getItem(`profile_${userId}`);
    const profile = raw ? JSON.parse(raw) : null;
    if (!profile?.cccdNumber) return {};
    return { identityNumber: profile.cccdNumber };
  } catch {
    return {};
  }
};

export const getShopProfile = async (userId, user) => {
  await mockDelay();

  let apiSeller = null;
  try {
    apiSeller = unwrap(
      await api.get('sellers/me', { skipErrorRedirect: true })
    );
  } catch (err) {
    console.error('[shopService] sellers/me (optional):', err);
    /* chưa có hồ sơ seller trên API / lỗi mạng → dùng dữ liệu local */
  }

  // Nền tảng: mặc định ← đơn local ← hồ sơ seller API ← CCCD từ Thông tin cá nhân.
  const base = {
    ...defaultProfile(user),
    ...fromApplication(readSellerApplication(userId)),
    ...fromApiSeller(apiSeller),
    ...fromUserProfile(userId),
  };

  const raw = localStorage.getItem(shopKey(userId));
  if (!raw) return base;
  try {
    // Bản người bán tự chỉnh sửa chỉ ghi đè field CÓ giá trị — chuỗi rỗng lưu
    // từ trước không được che mất dữ liệu từ đơn/API.
    const saved = JSON.parse(raw);
    const merged = { ...base };
    Object.entries(saved).forEach(([key, value]) => {
      if (value !== '' && value != null) merged[key] = value;
    });
    return merged;
  } catch {
    return base;
  }
};

export const saveShopProfile = async (userId, profileData) => {
  await mockDelay(800);
  safeSetItem(shopKey(userId), JSON.stringify(profileData));
  return profileData;
};
