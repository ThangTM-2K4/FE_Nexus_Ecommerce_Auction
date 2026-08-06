import api from "../config/api";
import { updateSessionUser } from "./authService";
import { syncBankFromSellerApplication } from "./bankAccountService";
import { toRegisterBody } from "./sellerPayload";

// Response backend bọc kiểu { data, message }. Phải phân biệt "data = null"
// (không có đơn) với "không bọc". Nếu dùng ?? sẽ nhầm data:null thành cả cục
// wrapper → sinh ra đơn giả. Vì vậy check có key 'data' hay không.
const unwrap = (res) => {
  const body = res?.data;
  if (body && typeof body === "object" && "data" in body) return body.data;
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
  if (status === "APPROVED") {
    return [
      { step: "Đã nộp đơn", status: "completed", date: submittedAt },
      { step: "Đang xem xét", status: "completed", date: reviewedAt },
      { step: "Đã phê duyệt", status: "completed", date: reviewedAt },
    ];
  }
  if (status === "REJECTED") {
    return [
      { step: "Đã nộp đơn", status: "completed", date: submittedAt },
      { step: "Đang xem xét", status: "completed", date: reviewedAt },
      { step: "Bị từ chối", status: "completed", date: reviewedAt },
    ];
  }
  return [
    { step: "Đã nộp đơn", status: "completed", date: submittedAt },
    { step: "Đang xem xét", status: "current", date: null },
    { step: "Chờ quyết định", status: "pending", date: null },
  ];
};

const normalizeApplication = (raw) => {
  if (!raw) return null;

  const status = String(raw.status ?? "").toUpperCase() || "PENDING";

  const submittedAt =
    raw.submittedAt ??
    raw.createdAt ??
    raw.appliedAt ??
    raw.registeredAt ??
    raw.createdDate ??
    null;

  const reviewedAt =
    raw.reviewedAt ?? raw.updatedAt ?? raw.reviewedDate ?? null;

  return {
    ...raw,

    applicationId: raw.applicationId ?? raw.id ?? raw.sellerId ?? null,

    status,

    submittedAt,

    reviewedAt,

    rejectionReason:
      raw.rejectionReason ?? raw.rejectReason ?? raw.reason ?? null,

    adminNote: raw.adminNote ?? raw.note ?? null,

    timeline: raw.timeline ?? buildTimeline(status, submittedAt, reviewedAt),

    businessType: raw.businessType ?? raw.sellerType,

    accountNumber: raw.accountNumber ?? raw.bankAccountNumber,

    bankName: raw.bankName,

    accountHolder: raw.accountHolder ?? raw.bankAccountHolder,

    // NEW: private upload key
    businessLicenseKey: raw.businessLicenseKey ?? raw.businessLicense ?? null,
  };
};

// Lưu bản ghi đầy đủ vào localStorage để trang "Duyệt người bán" (staff) hiển thị.
const writeLocalSellerApplication = (userId, form, application) => {
  const record = {
    applicationId: application?.applicationId || `SA-${Date.now()}`,
    userId,
    status: "PENDING",
    submittedAt: application?.submittedAt || new Date().toISOString(),
    fullName: form.cccdFullName || form.accountHolder || "Người dùng",
    cccdNumber: form.cccdNumber || "",
    cccdAddress: form.cccdAddress || "",
    frontImageUrl: form.cccdFrontImageUrl || "",
    backImageUrl: form.cccdBackImageUrl || "",
    email: form.email || "",
    phone: form.phone || "",
    shopName: form.shopName || "",
    category: form.businessType === "business" ? "Doanh nghiệp" : "Cá nhân",
    taxCode: form.taxCode || "",
    businessType: form.businessType || "",
    pickupAddress: form.pickupAddress || "",
    businessLicenseKey: form.businessLicenseKey || "",
    businessLicense: form.businessLicenseKey || "",
    bankName: form.bankName || "",
    accountNumber: form.accountNumber || "",
    accountHolder: form.accountHolder || "",
    documents: [
      "CCCD mặt trước",
      "CCCD mặt sau",
      // Giấy phép kinh doanh giờ bắt buộc với mọi loại hình -> luôn có trong hồ sơ duyệt.
      "Giấy phép kinh doanh",
      ...(form.businessType === "business" ? ["Mã số thuế doanh nghiệp"] : []),
    ],
  };
  try {
    localStorage.setItem(
      `mockSellerApplication_${userId}`,
      JSON.stringify(record),
    );
  } catch {
    /* bỏ qua nếu localStorage lỗi */
  }
  return record;
};

// Đồng bộ CCCD cập nhật ở "Thông tin cá nhân" sang bản ghi đơn/hồ sơ seller
// (mockSellerApplication_*) — nguồn dữ liệu của Hồ Sơ Shop và trang staff duyệt.
export const syncProfileToSellerApplication = (userId, cccd) => {
  if (!userId) return false;
  try {
    const key = `mockSellerApplication_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const record = JSON.parse(raw);
    localStorage.setItem(
      key,
      JSON.stringify({
        ...record,
        fullName: cccd.cccdFullName || record.fullName,
        cccdNumber: cccd.cccdNumber || record.cccdNumber,
        cccdGender: cccd.cccdGender || record.cccdGender,
        cccdDateOfBirth: cccd.cccdDateOfBirth || record.cccdDateOfBirth,
        cccdIssueDate: cccd.cccdIssueDate || record.cccdIssueDate,
        cccdExpiryDate: cccd.cccdExpiryDate || record.cccdExpiryDate,
        cccdIssuePlace: cccd.cccdIssuePlace || record.cccdIssuePlace,
        cccdAddress: cccd.cccdAddress || record.cccdAddress,
        frontImageUrl: cccd.cccdFrontImageUrl || record.frontImageUrl,
        backImageUrl: cccd.cccdBackImageUrl || record.backImageUrl,
      }),
    );
    return true;
  } catch {
    return false;
  }
};

// GET /api/v1/sellers/me
// Nguồn chính là API. Bản ghi local (mockSellerApplication_${userId}) — nơi
// staff ghi kết quả duyệt trên cùng máy — được dùng làm dự phòng để luồng
// seller ↔ staff demo được khép kín KHÔNG cần backend:
//   • API rỗng / 404 / lỗi mạng  → trả trạng thái từ bản ghi local (nếu có).
//   • API trả PENDING nhưng staff đã duyệt/từ chối local → ưu tiên local.
export const getSellerApplication = async (userId) => {
  const local = readLocalRecord(userId);
  const localApp = local ? normalizeApplication(local) : null;
  const localDecided =
    localApp?.status === "APPROVED" || localApp?.status === "REJECTED";

  try {
    const res = await api.get("sellers/me");
    const app = normalizeApplication(unwrap(res));
    // API chưa có đơn nào → dùng bản ghi local (staff có thể đã duyệt trên máy này).
    if (!app) return localApp;

    const submittedAt = app.submittedAt ?? local?.submittedAt ?? null;
    const reviewedAt = app.reviewedAt ?? local?.reviewedAt ?? null;

    // Backend chưa cập nhật quyết định của staff (vẫn PENDING) nhưng local đã
    // có APPROVED/REJECTED → cho local thắng để seller thấy đúng kết quả.
    const useLocalDecision = localDecided && app.status === "PENDING";
    const status = useLocalDecision ? localApp.status : app.status;

    return {
      ...app,
      status,
      applicationId: app.applicationId ?? local?.applicationId ?? null,
      submittedAt,
      reviewedAt: useLocalDecision
        ? (local?.reviewedAt ?? reviewedAt)
        : reviewedAt,
      rejectionReason: app.rejectionReason ?? localApp?.rejectionReason ?? null,
      adminNote: app.adminNote ?? localApp?.adminNote ?? null,
      timeline: useLocalDecision
        ? buildTimeline(status, submittedAt, local?.reviewedAt ?? reviewedAt)
        : (app.timeline ?? buildTimeline(status, submittedAt, reviewedAt)),
    };
  } catch {
    // 404 = chưa đăng ký; lỗi khác = mạng/không có backend. Cả hai đều rơi về
    // bản ghi local (null nếu chưa có đơn → trang hiện form đăng ký), thay vì
    // ném lỗi làm trang kẹt ở trạng thái "Đang tải...".
    return localApp;
  }
};

// POST /api/v1/sellers/register
export const submitSellerApplication = async (userId, form) => {
  let application;
  try {
    const res = await api.post("sellers/register", toRegisterBody(form));
    application = normalizeApplication(unwrap(res)) ?? {
      ...form,
      status: "PENDING",
    };
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
    status: application.status ?? "PENDING",
    timeline:
      application.timeline ||
      buildTimeline(application.status ?? "PENDING", record.submittedAt, null),
  };

  updateSessionUser({ sellerStatus: application.status ?? "PENDING" });
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
  const res = await api.post("sellers/resubmit", body);
  let application = normalizeApplication(unwrap(res)) ?? {
    ...form,
    status: "PENDING",
  };

  const record = writeLocalSellerApplication(userId, form, application);
  application = {
    ...application,
    applicationId: application.applicationId || record.applicationId,
    submittedAt: application.submittedAt || record.submittedAt,
    status: application.status ?? "PENDING",
    timeline:
      application.timeline ||
      buildTimeline(application.status ?? "PENDING", record.submittedAt, null),
  };

  updateSessionUser({ sellerStatus: application.status ?? "PENDING" });
  await syncBankFromSellerApplication(userId, {
    ...form,
    applicationId: application.applicationId,
    submittedAt: application.submittedAt,
  });

  return application;
};

// PUT /api/v1/management/sellers-applications/{id}/approve
export const simulateAdminApproval = async (sellerId) => {
  const res = await api.put(
    `management/sellers-applications/${sellerId}/approve`,
  );
  const application = normalizeApplication(unwrap(res));
  updateSessionUser({ sellerStatus: "APPROVED" });
  return application;
};

// PUT /api/v1/management/sellers-applications/{id}/reject  body: { reason }
// RejectSellerRequest chỉ nhận { reason } — field note không có trong swagger BE
export const simulateAdminRejection = async (sellerId, reason) => {
  const res = await api.put(
    `management/sellers-applications/${sellerId}/reject`,
    { reason },
  );
  const application = normalizeApplication(unwrap(res));
  updateSessionUser({ sellerStatus: "REJECTED" });
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
  // Backend từ chối register nếu CHƯA xác minh danh tính (CCCD) — chặn ngay ở
  // đây để người dùng thấy checklist rõ ràng thay vì lỗi tiếng Anh lúc nộp cuối.
  return (
    checks.emailVerified && checks.phoneVerified && checks.nationalIdVerified
  );
};
