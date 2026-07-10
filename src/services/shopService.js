import { mockDelay } from './mockDelay';
import { safeSetItem } from '../utils/safeSetItem';

const shopKey = (userId) => `mockSellerShopProfile_${userId}`;

const defaultProfile = (user) => ({
  shopName: user?.fullName ? `${user.fullName}'s Shop` : '',
  logo: null,
  cover: null,
  description: '',
  taxCode: '',
  businessAddress: '',
  businessType: 'individual',
  identityNumber: '',
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
  return filled;
};

export const getShopProfile = async (userId, user) => {
  await mockDelay();
  // Nền tảng: mặc định + dữ liệu từ đơn đăng ký đã duyệt.
  const base = { ...defaultProfile(user), ...fromApplication(readSellerApplication(userId)) };
  const raw = localStorage.getItem(shopKey(userId));
  if (!raw) return base;
  try {
    // Bản người bán tự chỉnh sửa (lưu riêng) sẽ ghi đè lên dữ liệu từ đơn.
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return base;
  }
};

export const saveShopProfile = async (userId, profileData) => {
  await mockDelay(800);
  safeSetItem(shopKey(userId), JSON.stringify(profileData));
  return profileData;
};
