import api from '../config/api';

const unwrapData = (resData) => resData?.data ?? resData;
const unwrapPagedList = (resData) => {
  const payload = unwrapData(resData);
  if (Array.isArray(payload)) return { items: payload, total: payload.length };
  if (payload?.items && Array.isArray(payload.items)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return { items: payload.data, total: payload.totalCount ?? payload.data.length };
  return { items: [], total: 0 };
};

/**
 * 1. Lấy danh sách kho hàng của Seller — GET /api/v1/warehouses
 */
export async function getSellerWarehouses(params = {}) {
  try {
    const { data } = await api.get('/warehouses', {
      params: { pageSize: 100, pageNumber: 1, ...params },
      skipErrorRedirect: true,
    });
    return unwrapPagedList(data);
  } catch (err) {
    return { items: [], total: 0 };
  }
}

/**
 * 2. Chi tiết kho hàng — GET /api/v1/warehouses/{warehouseId}
 */
export async function getSellerWarehouseById(warehouseId) {
  const { data } = await api.get(`/warehouses/${warehouseId}`, { skipErrorRedirect: true });
  return unwrapData(data);
}

/**
 * 3. Tạo kho hàng mới của Seller — POST /api/v1/warehouses
 * Payload sample:
 * {
 *   "name": "Kho Hàng Chính",
 *   "contactName": "Nguyen Văn A",
 *   "phoneNumber": "0912345678",
 *   "addressLine": "123 Đường ABC",
 *   "wardCode": "10001",
 *   "districtId": 1,
 *   "provinceId": 1,
 *   "isPrimary": true
 * }
 */
export async function createSellerWarehouse(payload) {
  const { data } = await api.post('/warehouses', payload);
  return unwrapData(data);
}

/**
 * 4. Cập nhật thông tin kho hàng — PUT /api/v1/warehouses/{warehouseId}
 */
export async function updateSellerWarehouse(warehouseId, payload, rowVersion) {
  const headers = rowVersion ? { 'If-Match': rowVersion } : {};
  const { data } = await api.put(`/warehouses/${warehouseId}`, payload, { headers });
  return unwrapData(data);
}

/**
 * 5. Đổi trạng thái kho hàng — PATCH /api/v1/warehouses/{warehouseId}/status
 */
export async function updateSellerWarehouseStatus(warehouseId, status, rowVersion) {
  const headers = rowVersion ? { 'If-Match': rowVersion } : {};
  const body = typeof status === 'object' ? status : { status, isActive: status === 'ACTIVE' || status === true };
  const { data } = await api.patch(`/warehouses/${warehouseId}/status`, body, { headers });
  return unwrapData(data);
}

/**
 * 6. Xóa kho hàng — DELETE /api/v1/warehouses/{warehouseId}
 */
export async function deleteSellerWarehouse(warehouseId, rowVersion) {
  const headers = rowVersion ? { 'If-Match': rowVersion } : {};
  const { data } = await api.delete(`/warehouses/${warehouseId}`, { headers });
  return unwrapData(data);
}
