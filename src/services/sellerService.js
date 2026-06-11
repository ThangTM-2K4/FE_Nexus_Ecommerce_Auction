import { mockDelay } from './mockDelay';
import { updateSessionUser } from './authService';

const applicationKey = (userId) => `mockSellerApplication_${userId}`;

export const getSellerApplication = async (userId) => {
  await mockDelay();
  const raw = localStorage.getItem(applicationKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const submitSellerApplication = async (userId, applicationData) => {
  await mockDelay(1000);

  const application = {
    applicationId: `SA-${Date.now()}`,
    userId,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
    ...applicationData,
    timeline: [
      { step: 'Submitted', status: 'completed', date: new Date().toISOString() },
      { step: 'Under Review', status: 'current', date: null },
      { step: 'Decision', status: 'pending', date: null },
    ],
  };

  localStorage.setItem(applicationKey(userId), JSON.stringify(application));
  updateSessionUser({ sellerStatus: 'PENDING' });

  return application;
};

export const resubmitSellerApplication = async (userId, applicationData) => {
  await mockDelay(1000);
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
  bankAccountAdded: profile?.bankAccount != null,
});

export const allPreconditionsMet = (profile) => {
  const checks = checkSellerPreconditions(profile);
  return checks.emailVerified && checks.phoneVerified && checks.bankAccountAdded;
};
