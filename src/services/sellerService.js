import api from '../config/api';
import { updateSessionUser } from './authService';
import { syncBankFromSellerApplication } from './bankAccountService';

const safeUrl = (v) => {
  if (!v) return '';
  if (typeof v === 'string' && v.startsWith('data:')) return 'uploaded';
  return v;
};

// Backend dùng enum PascalCase: "Individual" | "Business". Form lưu chữ thường
// ("individual"/"business") nên phải chuyển đúng enum, nếu không register bị
// từ chối (400) và đơn không được tạo.
const toSellerTypeEnum = (t) => {
  const v = String(t ?? '').toLowerCase();
  return v === 'business' ? 'Business' : 'Individual';
};

const toRegisterBody = (form) => ({
  sellerType: toSellerTypeEnum(form.businessType),
  businessName: form.shopName,
  taxCode: form.taxCode,
  businessLicenseUrl: safeUrl(form.businessLicense),
  address: form.pickupAddress,
  bankAccountNumber: form.accountNumber,
  bankName: form.bankName,
  bankAccountHolder: form.accountHolder,
});

// Response backend bọc kiểu { data, message }. Phải phân biệt "data = null"
// (không có đơn) với "không bọc". Nếu dùng ?? sẽ nhầm data:null thành cả cục
// wrapper → sinh ra đơn giả. Vì vậy check có key 'data' hay không.
const unwrap = (res) => {
  const body = res?.data;
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body ?? null;
};

// Đọc bản ghi đơn đã lưu ở localStorage lúc nộp — dùng để bù mã đơn và
// thời gian nộp khi API không trả về các trường này.
const readLocalRecord = (userId) => {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(`mockSellerApplication_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const buildTimeline = (status, submittedAt, reviewedAt) => {
  if (status === 'APPROVED') {
    return [
      { step: 'Đã nộp đơn', status: 'completed', date: submittedAt },
      { step: 'Đang xem xét', status: 'completed', date: reviewedAt },
      { step: 'Đã phê duyệt', status: 'completed', date: reviewedAt },
    ];
  }
  if (status === 'REJECTED') {
    return [
      { step: 'Đã nộp đơn', status: 'completed', date: submittedAt },
      { step: 'Đang xem xét', status: 'completed', date: reviewedAt },
      { step: 'Bị từ chối', status: 'completed', date: reviewedAt },
    ];
  }
  return [
    { step: 'Đã nộp đơn', status: 'completed', date: submittedAt },
    { step: 'Đang xem xét', status: 'current', date: null },
    { step: 'Chờ quyết định', status: 'pending', date: null },
  ];
};

const normalizeApplication = (raw) => {
  if (!raw) return null;
  const status = String(raw.status ?? '').toUpperCase() || 'PENDING';
  const submittedAt =
    raw.submittedAt ?? raw.createdAt ?? raw.appliedAt ?? raw.registeredAt ?? raw.createdDate ?? null;
  const reviewedAt = raw.reviewedAt ?? raw.updatedAt ?? raw.reviewedDate ?? null;

  return {
    ...raw,
    applicationId: raw.applicationId ?? raw.id ?? raw.sellerId ?? null,
    status,
    submittedAt,
    reviewedAt,
    rejectionReason: raw.rejectionReason ?? raw.rejectReason ?? raw.reason ?? null,
    adminNote: raw.adminNote ?? raw.note ?? null,
    timeline: raw.timeline ?? buildTimeline(status, submittedAt, reviewedAt),
    businessType: raw.businessType ?? raw.sellerType,
    accountNumber: raw.accountNumber ?? raw.bankAccountNumber,
    bankName: raw.bankName,
    accountHolder: raw.accountHolder ?? raw.bankAccountHolder,
  };
};

// Lưu bản ghi đầy đủ vào localStorage để trang "Duyệt người bán" (staff) hiển thị.
const writeLocalSellerApplication = (userId, form, application) => {
  const record = {
    applicationId: application?.applicationId || `SA-${Date.now()}`,
    userId,
    status: 'PENDING',
    submittedAt: application?.submittedAt || new Date().toISOString(),
    fullName: form.cccdFullName || form.accountHolder || 'Người dùng',
    cccdNumber: form.cccdNumber || '',
    cccdAddress: form.cccdAddress || '',
    frontImageUrl: form.cccdFrontImageUrl || '',
    backImageUrl: form.cccdBackImageUrl || '',
    email: form.email || '',
    phone: form.phone || '',
    shopName: form.shopName || '',
    category: form.businessType === 'business' ? 'Doanh nghiệp' : 'Cá nhân',
    taxCode: form.taxCode || '',
    businessType: form.businessType || '',
    pickupAddress: form.pickupAddress || '',
    businessLicense: form.businessLicense || '',
    bankName: form.bankName || '',
    accountNumber: form.accountNumber || '',
    accountHolder: form.accountHolder || '',
    documents: [
      'CCCD mặt trước',
      'CCCD mặt sau',
      form.businessType === 'business' ? 'Giấy phép kinh doanh' : 'Giấy tờ định danh',
    ],
  };
  try {
    localStorage.setItem(`mockSellerApplication_${userId}`, JSON.stringify(record));
  } catch {
    /* bỏ qua nếu localStorage lỗi */
  }
  return record;
};

// GET /api/v1/sellers/me
export const getSellerApplication = async (userId) => {
  try {
    const res = await api.get('sellers/me');
    const app = normalizeApplication(unwrap(res));
    if (!app) return null;

    // Bù mã đơn + thời gian nộp từ bản ghi local nếu API không trả về,
    // tránh hiển thị mã trống và ngày 1/1/1970.
    const local = readLocalRecord(userId);
    const submittedAt = app.submittedAt ?? local?.submittedAt ?? null;
    const reviewedAt = app.reviewedAt ?? local?.reviewedAt ?? null;
    return {
      ...app,
      applicationId: app.applicationId ?? local?.applicationId ?? null,
      submittedAt,
      reviewedAt,
      timeline: app.timeline ?? buildTimeline(app.status, submittedAt, reviewedAt),
    };
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

// POST /api/v1/sellers/register
export const submitSellerApplication = async (userId, form) => {
  let application;
  try {
    const res = await api.post('sellers/register', toRegisterBody(form));
    application = normalizeApplication(unwrap(res)) ?? { ...form, status: 'PENDING' };
  } catch (err) {
    const existing = await getSellerApplication(userId).catch(() => null);
    if (!existing) throw err;
    application = existing;
  }

  // writeLocalSellerApplication sinh mã đơn (SA-...) và thời gian nộp thực nếu
  // API không trả về — bù ngược lại vào object để hiển thị đúng ngay.
  const record = writeLocalSellerApplication(userId, form, application);
  application = {
    ...application,
    applicationId: application.applicationId || record.applicationId,
    submittedAt: application.submittedAt || record.submittedAt,
    status: application.status ?? 'PENDING',
    timeline:
      application.timeline ||
      buildTimeline(application.status ?? 'PENDING', record.submittedAt, null),
  };

  updateSessionUser({ sellerStatus: application.status ?? 'PENDING' });
  await syncBankFromSellerApplication(userId, {
    ...form,
    applicationId: application.applicationId,
    submittedAt: application.submittedAt,
  });

  return application;
};

// POST /api/v1/sellers/resubmit
export const resubmitSellerApplication = async (userId, form) => {
  const { sellerType, ...body } = toRegisterBody(form);
  const res = await api.post('sellers/resubmit', body);
  let application = normalizeApplication(unwrap(res)) ?? { ...form, status: 'PENDING' };

  const record = writeLocalSellerApplication(userId, form, application);
  application = {
    ...application,
    applicationId: application.applicationId || record.applicationId,
    submittedAt: application.submittedAt || record.submittedAt,
    status: application.status ?? 'PENDING',
    timeline:
      application.timeline ||
      buildTimeline(application.status ?? 'PENDING', record.submittedAt, null),
  };

  updateSessionUser({ sellerStatus: application.status ?? 'PENDING' });
  await syncBankFromSellerApplication(userId, {
    ...form,
    applicationId: application.applicationId,
    submittedAt: application.submittedAt,
  });

  return application;
};

// PUT /api/v1/admin/sellers/{id}/approve
export const simulateAdminApproval = async (sellerId) => {
  const res = await api.put(`admin/sellers/${sellerId}/approve`);
  const application = normalizeApplication(unwrap(res));
  updateSessionUser({ sellerStatus: 'APPROVED' });
  return application;
};

// PUT /api/v1/admin/sellers/{id}/reject
export const simulateAdminRejection = async (sellerId, reason, adminNote) => {
  const res = await api.put(`admin/sellers/${sellerId}/reject`, {
    reason,
    note: adminNote,
  });
  const application = normalizeApplication(unwrap(res));
  updateSessionUser({ sellerStatus: 'REJECTED' });
  return application;
};

export const checkSellerPreconditions = (profile) => ({
  emailVerified: profile?.isEmailVerified === true,
  phoneVerified: profile?.isPhoneVerified === true,
  nationalIdVerified: profile?.isNationalIdVerified === true,
  bankAccountAdded: profile?.bankAccount != null,
});

export const allPreconditionsMet = (profile) => {
  const checks = checkSellerPreconditions(profile);
  return checks.emailVerified && checks.phoneVerified;
};
