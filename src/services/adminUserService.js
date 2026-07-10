import api from "../config/api";
import { displayValue, formatDateTime, normalizeEnum } from "../utils/apiDisplay";
import { getApiErrorMessage, unwrapData, unwrapPagedList } from "../utils/apiResponse";

export { getApiErrorMessage };

export const GENDER_FILTER_OPTIONS = [
  { value: "Male", label: "Nam" },
  { value: "Female", label: "Nữ" },
  { value: "Other", label: "Khác" },
];

export const USER_STATUS_FILTER_OPTIONS = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
  { value: "LOCKED", label: "Đã khóa" },
];

const STATUS_UI_MAP = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
  LOCKED: "Đã khóa",
};

const GENDER_UI_MAP = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

export const USER_ROLE_TABS = [
  { id: "customer", label: "Khách hàng" },
  { id: "admin", label: "Quản trị viên" },
  { id: "seller", label: "Seller" },
];

export const ADMIN_ACCOUNT_ROLES = ["ADMIN", "SUPER_ADMIN", "MODERATOR", "SUPPORT", "FINANCE", "STAFF"];

export const ROLE_LABELS = {
  USER: "Khách hàng",
  CUSTOMER: "Khách hàng",
  BUYER: "Khách hàng",
  SELLER: "Seller",
  ADMIN: "Quản trị viên",
  SUPER_ADMIN: "Super Admin",
  MODERATOR: "Kiểm duyệt",
  SUPPORT: "Hỗ trợ",
  FINANCE: "Tài chính",
  STAFF: "Nhân viên",
};

export const getPrimaryRoleLabel = (roles = []) => {
  const normalized = roles.map((r) => normalizeEnum(r));
  const priority = ["SUPER_ADMIN", "ADMIN", "MODERATOR", "FINANCE", "SUPPORT", "STAFF", "SELLER", "USER", "CUSTOMER", "BUYER"];
  const match = priority.find((role) => normalized.includes(role));
  return match ? (ROLE_LABELS[match] ?? match) : "Khách hàng";
};

export const classifyUserByRole = (user) => {
  const roles = (user?.roles ?? user?.roleCodes ?? []).map((r) => normalizeEnum(r));
  if (roles.some((r) => ADMIN_ACCOUNT_ROLES.includes(r))) return "admin";
  return "customer";
};

export const filterUsersByRoleTab = (users, tab) => {
  if (tab === "seller") return users;
  return users.filter((user) => classifyUserByRole(user) === tab);
};

export const enrichUsersWithRoles = async (items, getDetail) => {
  const results = await Promise.all(
    items.map(async (user) => {
      const roles = user.roles ?? user._raw?.roles ?? user._raw?.roleCodes;
      if (roles?.length) return user;
      try {
        const detail = await getDetail(user.id);
        return mapUserToCard(detail);
      } catch {
        return user;
      }
    })
  );
  return results.filter(Boolean);
};

export const mapUserStatusToUi = (status) => {
  if (!status) return "—";
  return STATUS_UI_MAP[normalizeEnum(status)] ?? displayValue(status);
};

export const mapUserGenderToUi = (gender) => {
  if (!gender) return "—";
  return GENDER_UI_MAP[normalizeEnum(gender)] ?? displayValue(gender);
};

export const mapUserToCard = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    fullName: user.fullName,
    name: user.fullName ?? "—",
    email: user.email ?? "—",
    phoneNumber: user.phoneNumber,
    phone: user.phoneNumber ?? "—",
    identityNumber: displayValue(user.identityNumber),
    gender: mapUserGenderToUi(user.gender),
    address: displayValue(user.address),
    dateOfBirth: displayValue(user.dateOfBirth),
    status: mapUserStatusToUi(user.status),
    apiStatus: user.status,
    isEmailConfirmed: user.isEmailConfirmed,
    isPhoneConfirmed: user.isPhoneConfirmed,
    roles: user.roles ?? user.roleCodes ?? [],
    roleLabel: getPrimaryRoleLabel(user.roles ?? user.roleCodes ?? []),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    _raw: user,
  };
};

export const formatUserDetail = (user) => {
  if (!user) return null;

  const roles = user.roles ?? user.roleCodes ?? [];

  return {
    id: user.id,
    "Họ tên": displayValue(user.fullName),
    Email: displayValue(user.email),
    "Số điện thoại": displayValue(user.phoneNumber),
    "CCCD/CMND": displayValue(user.identityNumber),
    "Giới tính": mapUserGenderToUi(user.gender),
    "Ngày sinh": displayValue(user.dateOfBirth),
    "Địa chỉ": displayValue(user.address),
    "Trạng thái": mapUserStatusToUi(user.status),
    "Email xác minh": user.isEmailConfirmed == null ? "—" : user.isEmailConfirmed ? "Có" : "Không",
    "SĐT xác minh": user.isPhoneConfirmed == null ? "—" : user.isPhoneConfirmed ? "Có" : "Không",
    "Vai trò": roles.length ? roles.join(", ") : "—",
    "Ngày tạo": formatDateTime(user.createdAt),
    "Cập nhật": formatDateTime(user.updatedAt),
    _raw: user,
  };
};

const USER_DETAIL_PUBLIC_KEYS = [
  "Họ tên", "Email", "Số điện thoại", "Trạng thái", "Vai trò",
  "Email xác minh", "SĐT xác minh", "Ngày tạo", "Cập nhật",
];

const USER_DETAIL_SENSITIVE_KEYS = [
  "CCCD/CMND", "Giới tính", "Ngày sinh", "Địa chỉ",
];

export const splitUserDetailFields = (user) => {
  const detail = formatUserDetail(user);
  if (!detail) return null;

  const pick = (keys) => Object.fromEntries(
    keys.map((key) => [key, detail[key]]).filter(([, value]) => value !== undefined)
  );

  return {
    id: detail.id,
    name: detail["Họ tên"],
    email: detail.Email,
    public: pick(USER_DETAIL_PUBLIC_KEYS),
    sensitive: pick(USER_DETAIL_SENSITIVE_KEYS),
    _raw: detail._raw,
  };
};

export const getAdminUsers = async ({ search, gender, status, page = 1, pageSize = 20 } = {}) => {
  const params = { page, pageSize };
  if (search?.trim()) params.search = search.trim();
  if (gender) params.gender = gender;
  if (status) params.status = status;

  const { data } = await api.get("/admin/users", { params });
  const paged = unwrapPagedList(data);

  return {
    ...paged,
    items: paged.items.map(mapUserToCard).filter(Boolean),
  };
};

export const getAdminUserById = async (id) => {
  const { data } = await api.get(`/admin/users/${id}`);
  return mapUserToCard(unwrapData(data));
};

export const getAdminUserDetail = async (id) => {
  const { data } = await api.get(`/admin/users/${id}`);
  return unwrapData(data);
};

export const createAdminUser = async (payload) => {
  const { data } = await api.post("/admin/users", payload);
  return unwrapData(data);
};

export const updateAdminUser = async (id, payload) => {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return unwrapData(data);
};

export const deleteAdminUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return unwrapData(data);
};

export const resetAdminUserPassword = async (id, payload) => {
  const { data } = await api.post(`/admin/users/${id}/password`, payload);
  return unwrapData(data);
};
