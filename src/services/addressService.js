import api from '../config/api';

// ─── Mapping helpers ──────────────────────────────────────────────────────────

/**
 * Chuyển response từ BE sang format FE đang dùng.
 * BE trả về: { id, recipientName, recipientPhone, province, ward, street, type, isDefault }
 * FE dùng:   { id, fullName, phone, province, district, addressLine, type, isDefault }
 */
const toFE = (addr) => {
  if (!addr) return null;
  return {
    id: addr.id,
    fullName: addr.recipientName ?? addr.fullName ?? '',
    phone: addr.recipientPhone ?? addr.phone ?? '',
    province: addr.province ?? '',
    district: addr.district ?? addr.ward ?? '',
    addressLine: addr.addressLine ?? addr.street ?? '',
    type: addr.type ?? 'home',
    isDefault: addr.isDefault ?? false,
  };
};

/**
 * Chuyển form FE → body gửi lên BE (CreateAddressRequest / UpdateAddressRequest).
 */
const toBE = (address) => ({
  recipientName: address.fullName,
  recipientPhone: address.phone,
  province: address.province,
  ward: address.district,
  street: address.addressLine,
  type: address.type,
  isDefault: address.isDefault ?? false,
});

const unwrap = (res) => {
  const body = res?.data;
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body ?? null;
};

// ─── Service functions ────────────────────────────────────────────────────────

export const getAddresses = async () => {
  const res = await api.get('/users/addresses');
  const data = unwrap(res);
  const list = Array.isArray(data) ? data : (data?.items ?? data?.addresses ?? []);
  return list.map(toFE).filter(Boolean);
};

export const addAddress = async (_userId, address) => {
  await api.post('/users/addresses', toBE(address));
  // Trả về danh sách mới nhất từ BE
  return getAddresses();
};

export const updateAddress = async (_userId, id, data) => {
  await api.put(`/users/addresses/${id}`, toBE(data));
  return getAddresses();
};

export const deleteAddress = async (_userId, id) => {
  await api.delete(`/users/addresses/${id}`);
  return getAddresses();
};

export const setDefaultAddress = async (_userId, id) => {
  await api.patch(`/users/addresses/${id}/default`);
  return getAddresses();
};
