import api from '../config/api';

// User Service (API mới): /api/v1/users/addresses
//   GET    /users/addresses                 -> danh sách
//   POST   /users/addresses                 -> tạo mới (CreateAddressRequest)
//   GET    /users/addresses/{addressId}      -> chi tiết
//   PUT    /users/addresses/{addressId}      -> cập nhật (UpdateAddressRequest)
//   DELETE /users/addresses/{addressId}      -> xoá
//   PATCH  /users/addresses/{addressId}/default -> đặt mặc định
//
// Model backend: { recipientName, recipientPhone, province, ward, street, type, isDefault }
// (địa chỉ 2 cấp: bỏ `district`, dùng `ward`). Người dùng được suy ra từ Bearer token
// nên các hàm dưới bỏ qua tham số userId (giữ lại cho tương thích với nơi gọi cũ).

const BASE = '/users/addresses';

// Backend hay bọc response { data, message }. Phân biệt "data = null" với "không bọc".
const unwrap = (res) => {
  const body = res?.data;
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body ?? null;
};

// Chuẩn hoá 1 địa chỉ về shape thống nhất, kèm alias field cũ để UI/checkout cũ
// (fullName/phone/addressLine/district) không vỡ khi chưa kịp đổi hết.
const normalize = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;
  const recipientName = raw.recipientName ?? raw.fullName ?? '';
  const recipientPhone = raw.recipientPhone ?? raw.phone ?? '';
  const street = raw.street ?? raw.addressLine ?? '';
  const ward = raw.ward ?? raw.district ?? '';
  const province = raw.province ?? '';
  return {
    id: raw.id ?? raw.addressId,
    recipientName,
    recipientPhone,
    province,
    ward,
    street,
    type: raw.type ?? 'home',
    isDefault: Boolean(raw.isDefault),
    // alias tương thích ngược
    fullName: recipientName,
    phone: recipientPhone,
    addressLine: street,
    district: ward,
  };
};

// Form -> body request khớp CreateAddressRequest / UpdateAddressRequest.
const toApiBody = (form = {}) => ({
  recipientName: form.recipientName ?? form.fullName ?? '',
  recipientPhone: form.recipientPhone ?? form.phone ?? '',
  province: form.province ?? '',
  ward: form.ward ?? form.district ?? '',
  street: form.street ?? form.addressLine ?? '',
  type: form.type ?? 'home',
  isDefault: Boolean(form.isDefault),
});

export const getAddresses = async () => {
  const res = await api.get(BASE);
  const data = unwrap(res);
  const list = Array.isArray(data) ? data : data?.items ?? [];
  return list.map(normalize);
};

// Các hàm mutation trả về danh sách mới (re-fetch) để nơi gọi set thẳng vào state.
export const addAddress = async (address) => {
  await api.post(BASE, toApiBody(address));
  return getAddresses();
};

export const updateAddress = async (id, data) => {
  await api.put(`${BASE}/${id}`, toApiBody(data));
  return getAddresses();
};

export const deleteAddress = async (id) => {
  await api.delete(`${BASE}/${id}`);
  return getAddresses();
};

export const setDefaultAddress = async (id) => {
  await api.patch(`${BASE}/${id}/default`);
  return getAddresses();
};

export const getAddressById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return normalize(unwrap(res));
};

/** Lấy địa chỉ mặc định từ danh sách (hoặc phần tử đầu). */
export const pickDefaultAddress = (list = []) =>
  list.find((a) => a.isDefault) || list[0] || null;
