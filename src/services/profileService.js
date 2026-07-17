import api from '../config/api';
import { getCurrentUser, updateSessionUser } from './authService';

const profileKey = (userId) => `profile_${userId}`;

const getStoredProfile = (userId) => {
  const raw = localStorage.getItem(profileKey(userId));
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* fall through */
    }
  }
  return null;
};

const saveProfile = (userId, profile) => {
  localStorage.setItem(profileKey(userId), JSON.stringify(profile));
};

const truthy = (...vals) => vals.some((v) => v === true || v === 'true');

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

// Lấy trạng thái xác minh CMND thật từ endpoint riêng
const fetchIdentityStatus = async () => {
  try {
    const iv = unwrap(await api.get('/identity-verifications/me'));
    return iv?.status ? String(iv.status).toUpperCase() : null;
  } catch {
    return null; // chưa nộp / 404
  }
};

const buildProfile = (src, identityStatus) => ({
  avatar: src.avatar || null,
  fullName: src.fullName || src.name || '',
  username: src.username || src.email?.split('@')[0] || '',
  email: src.email || '',
  phone: src.phone || src.phoneNumber || '',
  dateOfBirth: src.dateOfBirth || '',
  gender: src.gender || '',
  address: src.address || '',
  // Đọc cờ thật từ /users/me, chấp nhận nhiều tên field backend có thể dùng
  isEmailVerified: truthy(src.isEmailVerified, src.emailVerified, src.emailConfirmed, src.isEmailConfirmed),
  isPhoneVerified:
    truthy(src.isPhoneVerified, src.phoneVerified, src.phoneConfirmed, src.isPhoneConfirmed) ||
    src.phoneVerifiedLocal === true,
  // Cờ xác thực SĐT lưu local (backend staging chưa gửi OTP thật) — giữ lại khi reload
  phoneVerifiedLocal: src.phoneVerifiedLocal === true,
  isNationalIdVerified:
    identityStatus === 'APPROVED' ||
    identityStatus === 'VERIFIED' ||
    truthy(src.isNationalIdVerified, src.identityVerified),
  identityStatus,
  identityRejectReason: src.identityRejectReason || null,
  bankAccount: src.bankAccount || null,
  // Thông tin CCCD (trang "Thông tin cá nhân") — backend chưa có field riêng,
  // giữ lại từ profile đã lưu để không mất khi tải lại trang.
  cccdFullName: src.cccdFullName || '',
  cccdNumber: src.cccdNumber || '',
  cccdGender: src.cccdGender || '',
  cccdDateOfBirth: src.cccdDateOfBirth || '',
  cccdIssueDate: src.cccdIssueDate || '',
  cccdExpiryDate: src.cccdExpiryDate || '',
  cccdIssuePlace: src.cccdIssuePlace || '',
  cccdAddress: src.cccdAddress || '',
  cccdFrontImageUrl: src.cccdFrontImageUrl || '',
  cccdBackImageUrl: src.cccdBackImageUrl || '',
});

export const getProfile = async (userId) => {
  const sessionUser = getCurrentUser();
  const storedProfile = getStoredProfile(userId);

  // Nguồn sự thật: GET /users/me (fallback về session nếu API lỗi)
  let apiUser = null;
  try {
    apiUser = unwrap(await api.get('/users/me'));
  } catch {
    /* fallback */
  }

  // storedProfile trước để các field chỉ-lưu-local (CCCD) sống sót,
  // apiUser sau cùng để dữ liệu backend luôn thắng.
  const src = { ...(storedProfile || {}), ...(sessionUser || {}), ...(apiUser || {}) };

  // Các field người dùng tự chỉnh nhưng backend không lưu (UpdateProfileRequest chỉ có
  // phoneNumber/address/newEmail) -> ưu tiên bản đã lưu local để không bị ghi đè khi reload.
  const LOCAL_OWNED = ['fullName', 'username', 'gender', 'dateOfBirth', 'phone'];
  if (storedProfile) {
    LOCAL_OWNED.forEach((k) => {
      if (storedProfile[k] !== undefined && storedProfile[k] !== '') src[k] = storedProfile[k];
    });
  }

  let identityStatus = await fetchIdentityStatus();

  // Backend chưa có API cho staff duyệt CCCD — quyết định duyệt/từ chối của
  // staff lưu local phải thắng trạng thái PENDING (hoặc chưa nộp) từ API.
  const localDecision = storedProfile?.identityStatus;
  if (
    (identityStatus == null || identityStatus === 'PENDING') &&
    (localDecision === 'APPROVED' || localDecision === 'REJECTED')
  ) {
    identityStatus = localDecision;
  }

  const profile = buildProfile(src, identityStatus);
  saveProfile(userId, profile);
  return profile;
};

export const updateProfile = async (userId, data) => {
  const current = await getProfile(userId);
  const updated = { ...current, ...data };

  // Đẩy các field backend hỗ trợ lên /users/me (phoneNumber, address) — best-effort
  const body = {};
  if (data.phone !== undefined) body.phoneNumber = data.phone;
  if (data.address !== undefined) body.address = data.address;
  if (Object.keys(body).length) {
    try {
      await api.put('/users/me', body);
    } catch {
      /* vẫn lưu local nếu backend lỗi */
    }
  }

  saveProfile(userId, updated);

  updateSessionUser({
    fullName: updated.fullName,
    username: updated.username,
    email: updated.email,
    phone: updated.phone,
    isEmailVerified: updated.isEmailVerified,
    isPhoneVerified: updated.isPhoneVerified,
  });

  return updated;
};

// Xác thực SĐT: lưu số lên backend rồi đánh dấu đã xác minh (giữ local).
export const markPhoneVerified = async (userId, phoneNumber) => {
  try {
    await api.put('/users/me', { phoneNumber });
  } catch {
    /* vẫn đánh dấu local để demo qua điều kiện */
  }
  const current = await getProfile(userId);
  const updated = { ...current, phone: phoneNumber, isPhoneVerified: true, phoneVerifiedLocal: true };
  saveProfile(userId, updated);
  updateSessionUser({ phone: phoneNumber, isPhoneVerified: true });
  return updated;
};

// ── UPLOADS ── (ảnh đại diện + ảnh CCCD)
// Swagger user-service: POST /uploads/avatar và /uploads/identity, multipart field `file`.
// Base URL nằm trong .env (VITE_API_BASE_URL) — chỉ dùng path tương đối, KHÔNG hardcode host.
// Content-Type để undefined -> trình duyệt tự set multipart + boundary.
const MULTIPART = { headers: { 'Content-Type': undefined } };

// Response chưa được swagger mô tả -> dò nhiều tên field khả dĩ để lấy URL/key ảnh.
const extractUploadUrl = (res) => {
  const d = res?.data?.data ?? res?.data ?? {};
  if (typeof d === 'string') return d;
  return d.url || d.fileUrl || d.imageUrl || d.avatarUrl || d.key || d.fileKey || '';
};

export const uploadAvatar = async (userId, file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await api.post('/uploads/avatar', fd, MULTIPART);
  const url = extractUploadUrl(res);

  const current = await getProfile(userId);
  const updated = { ...current, avatar: url || current.avatar };
  saveProfile(userId, updated);
  updateSessionUser({ avatar: updated.avatar });
  return updated;
};

// Trả về URL/key ảnh CCCD đã upload để nộp kèm hồ sơ xác minh.
export const uploadIdentityImage = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await api.post('/uploads/identity', fd, MULTIPART);
  return extractUploadUrl(res);
};

// ── EMAIL ── (xác thực khi đăng ký; ở đây cho gửi lại + nhập OTP)
export const requestEmailVerification = async (userId) => {
  const profile = await getProfile(userId);
  await api.post('/auth/verify-email', { email: profile.email, otpCode: '' });
  return profile;
};

export const verifyEmailOtp = async (userId, otpCode) => {
  const profile = await getProfile(userId);
  await api.post('/auth/verify-email', { email: profile.email, otpCode });
  return getProfile(userId);
};

// ── SỐ ĐIỆN THOẠI ──
// Lưu SĐT lên backend trước khi gửi OTP (request-otp không nhận số,
// nó gửi mã tới SĐT đã lưu trên hồ sơ /users/me).
export const updatePhoneNumber = async (userId, phoneNumber) => {
  await api.put('/users/me', { phoneNumber });
  return getProfile(userId);
};

// (luồng OTP 2 bước)
export const requestPhoneOtp = async () => {
  await api.post('/users/me/phone/request-otp');
};

export const verifyPhoneOtp = async (userId, otpCode) => {
  await api.post('/users/me/phone/verify-otp', { otpCode });
  return getProfile(userId);
};

// ── CMND / CCCD ── (nộp đầy đủ thông tin CCCD + ảnh mặt trước/sau, staff duyệt)
// Nhận cả các field mới (gender, dateOfBirth, issueDate, expiryDate, issuePlace,
// permanentAddress) theo đúng contract backend; các field cũ vẫn tương thích.
export const submitIdentityVerification = async (
  userId,
  {
    fullName,
    gender,
    dateOfBirth,
    identityNumber,
    issueDate,
    expiryDate,
    issuePlace,
    permanentAddress,
    frontImageUrl,
    backImageUrl,
  }
) => {
  await api.post('/identity-verifications', {
    fullName,
    gender,
    dateOfBirth,
    identityNumber,
    issueDate,
    expiryDate,
    issuePlace,
    permanentAddress,
    frontImageUrl,
    backImageUrl,
  });
  return getProfile(userId);
};

// ── THÔNG TIN CÁ NHÂN / CCCD ── (trang "Thông tin cá nhân")
// Đẩy địa chỉ lên backend (UpdateProfileRequest hỗ trợ address),
// còn họ tên + số CCCD lưu local vì backend chưa có field riêng.
export const updateCccdInfo = async (
  userId,
  {
    cccdFullName,
    cccdNumber,
    cccdGender = '',
    cccdDateOfBirth = '',
    cccdIssueDate = '',
    cccdExpiryDate = '',
    cccdIssuePlace = '',
    cccdAddress,
    cccdFrontImageUrl = '',
    cccdBackImageUrl = '',
  }
) => {
  if (cccdAddress?.trim()) {
    try {
      await api.put('/users/me', { address: cccdAddress.trim() });
    } catch {
      /* vẫn lưu local nếu backend lỗi */
    }
  }
  return updateProfile(userId, {
    cccdFullName,
    cccdNumber,
    cccdGender,
    cccdDateOfBirth,
    cccdIssueDate,
    cccdExpiryDate,
    cccdIssuePlace,
    cccdAddress,
    cccdFrontImageUrl,
    cccdBackImageUrl,
  });
};

export const saveBankAccount = async (userId, bankAccount) => {
  return updateProfile(userId, { bankAccount });
};

export const removeBankAccount = async (userId) => {
  return updateProfile(userId, { bankAccount: null });
};

const mockActivity = {
  auctions: [
    { id: 1, title: 'iPhone 16 Pro Max', status: 'Won', amount: 24500000, date: '2026-05-20' },
    { id: 2, title: 'MacBook Air M3', status: 'Lost', amount: 28900000, date: '2026-05-15' },
    { id: 3, title: 'Sony WH-1000XM5', status: 'Active', amount: 5200000, date: '2026-06-01' },
  ],
  bids: [
    { id: 1, auction: 'Tai nghe Bluetooth Pro X2', bidAmount: 1290000, date: '2026-06-08', status: 'Leading' },
    { id: 2, auction: 'Đồng hồ Urban Fit', bidAmount: 1890000, date: '2026-06-07', status: 'Outbid' },
    { id: 3, auction: 'Balo laptop 15.6"', bidAmount: 690000, date: '2026-06-05', status: 'Won' },
  ],
  purchases: [
    { id: 1, product: 'Tai nghe Bluetooth Pro X2', price: 1290000, date: '2026-05-28', status: 'Delivered' },
    { id: 2, product: 'Balo laptop đa năng', price: 690000, date: '2026-05-10', status: 'Delivered' },
  ],
  transactions: [
    { id: 1, type: 'Deposit', amount: 5000000, date: '2026-05-01', status: 'Completed' },
    { id: 2, type: 'Bid Hold', amount: -500000, date: '2026-06-01', status: 'Completed' },
    { id: 3, type: 'Purchase', amount: -1290000, date: '2026-05-28', status: 'Completed' },
  ],
};

export const getActivityHistory = async () => {
  return mockActivity;
};
