import api from '../config/api';
import { getApiErrorMessage, unwrapData } from '../utils/apiResponse';
import { mockDelay } from './mockDelay';
import { updateSessionUser } from './authService';
import { syncBankFromSellerApplication } from './bankAccountService';

export { getApiErrorMessage };

const applicationKey = (userId) => `mockSellerApplication_${userId}`;

const SELLER_TYPE_MAP = {
  individual: 'Individual',
  business: 'Business',
};

const normalizeStatus = (status) => String(status ?? 'PENDING').toUpperCase();

const mapFormToRegisterPayload = (form) => ({
  sellerType: SELLER_TYPE_MAP[form.businessType] ?? form.sellerType ?? 'Individual',
  businessName: form.shopName ?? form.businessName ?? '',
  taxCode: form.taxCode ?? '',
  businessLicenseUrl: form.businessLicense ?? form.businessLicenseUrl ?? '',
  address: form.pickupAddress ?? form.address ?? '',
  bankAccountNumber: form.accountNumber ?? form.bankAccountNumber ?? '',
  bankName: form.bankName ?? '',
  bankAccountHolder: form.accountHolder ?? form.bankAccountHolder ?? '',
});

const buildTimeline = (status, submittedAt) => {
  const submitted = submittedAt ?? new Date().toISOString();
  const normalized = normalizeStatus(status);

  if (normalized === 'REJECTED') {
    return [
      { step: 'Submitted', status: 'completed', date: submitted },
      { step: 'Under Review', status: 'completed', date: null },
      { step: 'Rejected', status: 'completed', date: null },
    ];
  }

  if (normalized === 'APPROVED') {
    return [
      { step: 'Submitted', status: 'completed', date: submitted },
      { step: 'Under Review', status: 'completed', date: null },
      { step: 'Approved', status: 'completed', date: null },
    ];
  }

  return [
    { step: 'Submitted', status: 'completed', date: submitted },
    { step: 'Under Review', status: 'current', date: null },
    { step: 'Decision', status: 'pending', date: null },
  ];
};

const mapSellerResponseToApplication = (seller, userId, formData = {}) => {
  const raw = unwrapData(seller) ?? seller;
  const status = normalizeStatus(raw?.status);

  return {
    applicationId: raw?.id ?? `SA-${Date.now()}`,
    sellerId: raw?.id,
    userId,
    status,
    submittedAt: raw?.submittedAt ?? new Date().toISOString(),
    rejectReason: raw?.rejectReason,
    rejectionReason: raw?.rejectReason,
    ...formData,
    businessName: raw?.businessName ?? formData.shopName,
    shopName: raw?.businessName ?? formData.shopName,
    taxCode: raw?.taxCode ?? formData.taxCode,
    businessLicense: raw?.businessLicenseUrl ?? formData.businessLicense,
    pickupAddress: raw?.address ?? formData.pickupAddress,
    timeline: buildTimeline(status, raw?.submittedAt),
    _raw: raw,
  };
};

export const registerSeller = async (payload) => {
  const { data } = await api.post('/sellers/register', payload);
  return unwrapData(data);
};

export const getSellerApplication = async (userId) => {
  const raw = localStorage.getItem(applicationKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const submitSellerApplication = async (userId, applicationData) => {
  const payload = mapFormToRegisterPayload(applicationData);
  const seller = await registerSeller(payload);
  const application = mapSellerResponseToApplication(seller, userId, applicationData);

  localStorage.setItem(applicationKey(userId), JSON.stringify(application));
  updateSessionUser({ sellerStatus: normalizeStatus(seller?.status ?? application.status) });
  await syncBankFromSellerApplication(userId, application);

  return application;
};

export const resubmitSellerApplication = async (userId, applicationData) => {
  return submitSellerApplication(userId, applicationData);
};

export const simulateAdminApproval = async (userId) => {
  await mockDelay(800);
  const app = await getSellerApplication(userId);
  if (!app) throw new Error('Không tìm thấy đơn đăng ký');

  const updated = {
    ...app,
    status: 'APPROVED',
    reviewedAt: new Date().toISOString(),
    adminNote: 'Hồ sơ hợp lệ, chào mừng bạn trở thành người bán!',
    timeline: [
      { step: 'Submitted', status: 'completed', date: app.submittedAt },
      { step: 'Under Review', status: 'completed', date: new Date().toISOString() },
      { step: 'Approved', status: 'completed', date: new Date().toISOString() },
    ],
  };

  localStorage.setItem(applicationKey(userId), JSON.stringify(updated));
  updateSessionUser({ sellerStatus: 'APPROVED' });
  return updated;
};

export const simulateAdminRejection = async (userId, reason, adminNote) => {
  await mockDelay(800);
  const app = await getSellerApplication(userId);
  if (!app) throw new Error('Không tìm thấy đơn đăng ký');

  const updated = {
    ...app,
    status: 'REJECTED',
    reviewedAt: new Date().toISOString(),
    rejectionReason: reason || 'Tài liệu không rõ ràng hoặc không khớp thông tin.',
    adminNote: adminNote || 'Vui lòng tải lại ảnh CMND/CCCD rõ nét và đảm bảo thông tin khớp.',
    timeline: [
      { step: 'Submitted', status: 'completed', date: app.submittedAt },
      { step: 'Under Review', status: 'completed', date: new Date().toISOString() },
      { step: 'Rejected', status: 'completed', date: new Date().toISOString() },
    ],
  };

  localStorage.setItem(applicationKey(userId), JSON.stringify(updated));
  updateSessionUser({ sellerStatus: 'REJECTED' });
  return updated;
};

export const checkSellerPreconditions = (profile) => ({
  emailVerified: profile?.isEmailVerified === true,
  phoneVerified: profile?.isPhoneVerified === true,
  nationalIdVerified: profile?.isNationalIdVerified === true,
  bankAccountAdded: profile?.bankAccount != null,
});

export const allPreconditionsMet = (profile) => {
  const checks = checkSellerPreconditions(profile);
  return checks.emailVerified && checks.phoneVerified && checks.nationalIdVerified;
};
