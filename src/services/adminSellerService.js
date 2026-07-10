import api from "../config/api";
import { displayValue, formatDateTime, normalizeEnum } from "../utils/apiDisplay";
import { getApiErrorMessage, unwrapData, unwrapPagedList } from "../utils/apiResponse";

export { getApiErrorMessage };

export const SELLER_API_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

export const SELLER_FILTER_OPTIONS = [
  { value: SELLER_API_STATUS.PENDING, label: "Chờ duyệt" },
  { value: SELLER_API_STATUS.APPROVED, label: "Đã duyệt" },
  { value: SELLER_API_STATUS.REJECTED, label: "Từ chối" },
  { value: SELLER_API_STATUS.SUSPENDED, label: "Tạm khóa" },
];

export const SELLER_TYPE_LABELS = {
  Individual: "Cá nhân",
  Business: "Doanh nghiệp",
};

const STATUS_UI_MAP = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  SUSPENDED: "Tạm khóa",
};

export const mapSellerStatusToUi = (status) => STATUS_UI_MAP[normalizeEnum(status)] ?? displayValue(status);

export const isSellerPending = (status) => normalizeEnum(status) === "PENDING";

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value ?? ""));

const getSellerSubtitle = (seller) => {
  const holder = seller.bankAccountHolder;
  if (holder && !isUuid(holder)) return holder;
  return "";
};

export const mapSellerToCard = (seller) => {
  if (!seller) return null;

  const sellerTypeLabel = SELLER_TYPE_LABELS[seller.sellerType] ?? seller.sellerType;
  const subtitle = getSellerSubtitle(seller);

  return {
    id: seller.id,
    userId: seller.userId,
    sellerType: seller.sellerType,
    sellerTypeLabel,
    businessName: seller.businessName,
    name: seller.businessName ?? sellerTypeLabel ?? "—",
    owner: subtitle,
    subtitle,
    status: mapSellerStatusToUi(seller.status),
    apiStatus: seller.status,
    taxCode: seller.taxCode,
    address: displayValue(seller.address),
    bankName: seller.bankName,
    bankAccountNumber: seller.bankAccountNumber,
    bankAccountHolder: seller.bankAccountHolder,
    businessLicenseUrl: seller.businessLicenseUrl,
    rejectReason: seller.rejectReason,
    submittedAt: seller.submittedAt,
    reviewedAt: seller.reviewedAt,
    reviewedBy: seller.reviewedBy,
    _raw: seller,
  };
};

export const enrichSellersWithDetails = async (items, getDetail) => {
  const results = await Promise.all(
    items.map(async (seller) => {
      const raw = seller._raw ?? seller;
      const needsDetail = !raw.businessName || raw.address == null;
      if (!needsDetail) return seller;

      try {
        const detail = await getDetail(seller.id);
        return mapSellerToCard(detail);
      } catch {
        return seller;
      }
    })
  );
  return results.filter(Boolean);
};

export const mapSellerToVerification = (seller) => {
  const card = mapSellerToCard(seller);
  if (!card) return null;

  return {
    ...card,
    seller: card.businessName ?? card.sellerTypeLabel ?? "—",
    cccd: seller.identityNumber,
    businessLicense: seller.businessLicenseUrl,
    bankAccount: seller.bankAccountNumber
      ? `${displayValue(seller.bankName)} · ${displayValue(seller.bankAccountNumber)}`
      : "—",
    submittedAt: formatDateTime(seller.submittedAt),
  };
};

export const formatSellerDetail = (seller, { includeIds = false } = {}) => {
  if (!seller) return null;

  const detail = {
    "Loại seller": SELLER_TYPE_LABELS[seller.sellerType] ?? displayValue(seller.sellerType),
    "Tên doanh nghiệp / Shop": displayValue(seller.businessName),
    "Mã số thuế": displayValue(seller.taxCode),
    "Giấy phép KD": displayValue(seller.businessLicenseUrl),
    "Địa chỉ": displayValue(seller.address),
    "Số tài khoản": displayValue(seller.bankAccountNumber),
    "Ngân hàng": displayValue(seller.bankName),
    "Chủ tài khoản": displayValue(seller.bankAccountHolder),
    "Trạng thái": mapSellerStatusToUi(seller.status),
    "Lý do từ chối": displayValue(seller.rejectReason),
    "Ngày nộp": formatDateTime(seller.submittedAt),
    "Ngày duyệt": formatDateTime(seller.reviewedAt),
    "Duyệt bởi": displayValue(seller.reviewedBy),
    _raw: seller,
  };

  if (includeIds) {
    return {
      id: seller.id,
      "User ID": displayValue(seller.userId),
      ...detail,
      _raw: seller,
    };
  }

  return detail;
};

const SELLER_DETAIL_PUBLIC_KEYS = [
  "Loại seller", "Tên doanh nghiệp / Shop", "Trạng thái", "Ngày nộp", "Ngày duyệt", "Duyệt bởi",
];

const SELLER_DETAIL_SENSITIVE_KEYS = [
  "Mã số thuế", "Giấy phép KD", "Địa chỉ", "Số tài khoản", "Ngân hàng", "Chủ tài khoản", "Lý do từ chối",
];

export const splitSellerDetailFields = (seller) => {
  const detail = formatSellerDetail(seller);
  if (!detail) return null;

  const pick = (keys) => Object.fromEntries(
    keys.map((key) => [key, detail[key]]).filter(([, value]) => value !== undefined)
  );

  return {
    id: seller.id ?? detail._raw?.id,
    name: detail["Tên doanh nghiệp / Shop"],
    public: pick(SELLER_DETAIL_PUBLIC_KEYS),
    sensitive: pick(SELLER_DETAIL_SENSITIVE_KEYS),
    _raw: detail._raw,
  };
};

export const getAdminSellers = async ({ status, page = 1, pageSize = 20 } = {}) => {
  const params = { page, pageSize };
  if (status) params.status = status;

  const { data } = await api.get("/admin/sellers", { params });
  const paged = unwrapPagedList(data);

  return {
    ...paged,
    items: paged.items.map(mapSellerToCard).filter(Boolean),
  };
};

export const getAdminSellerById = async (id) => {
  const { data } = await api.get(`/admin/sellers/${id}`);
  return mapSellerToCard(unwrapData(data));
};

export const getAdminSellerDetail = async (id) => {
  const { data } = await api.get(`/admin/sellers/${id}`);
  return unwrapData(data);
};

export const approveAdminSeller = async (id) => {
  const { data } = await api.put(`/admin/sellers/${id}/approve`);
  return unwrapData(data);
};

export const rejectAdminSeller = async (id, reason) => {
  const { data } = await api.put(`/admin/sellers/${id}/reject`, { reason });
  return unwrapData(data);
};
