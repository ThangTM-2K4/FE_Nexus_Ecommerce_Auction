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
 * 1. Lấy danh sách vận đơn (Shipments) — GET /fulfillment/shipments hoặc /shipments
 */
export async function getFulfillmentShipments(params = {}) {
  try {
    const { data } = await api.get('/fulfillment/shipments', {
      params: { pageSize: 100, pageNumber: 1, ...params },
      skipErrorRedirect: true,
    });
    return unwrapPagedList(data);
  } catch (err) {
    try {
      const { data } = await api.get('/shipments', {
        params: { pageSize: 100, pageNumber: 1, ...params },
        skipErrorRedirect: true,
      });
      return unwrapPagedList(data);
    } catch {
      return { items: [], total: 0 };
    }
  }
}

/**
 * 2. Chi tiết vận đơn — GET /fulfillment/shipments/{id}
 */
export async function getFulfillmentShipmentById(shipmentId) {
  try {
    const { data } = await api.get(`/fulfillment/shipments/${shipmentId}`, { skipErrorRedirect: true });
    return unwrapData(data);
  } catch (err) {
    const { data } = await api.get(`/shipments/${shipmentId}`, { skipErrorRedirect: true });
    return unwrapData(data);
  }
}

/**
 * 3. Cập nhật trạng thái vận đơn — PATCH /fulfillment/shipments/{id}/status
 */
export async function updateShipmentStatus(shipmentId, status, note = '') {
  try {
    const { data } = await api.patch(`/fulfillment/shipments/${shipmentId}/status`, { status, note }, { skipErrorRedirect: true });
    return unwrapData(data);
  } catch (err) {
    const { data } = await api.patch(`/shipments/${shipmentId}/status`, { status, note }, { skipErrorRedirect: true });
    return unwrapData(data);
  }
}

/**
 * 4. Tính phí vận chuyển — POST /fulfillment/quotes
 */
export async function calculateShippingQuote(payload) {
  try {
    const { data } = await api.post('/fulfillment/quotes', payload, { skipErrorRedirect: true });
    return unwrapData(data);
  } catch (err) {
    const { data } = await api.post('/shipping/quotes', payload, { skipErrorRedirect: true });
    return unwrapData(data);
  }
}

/**
 * 5. Danh sách đối tác vận chuyển — GET /fulfillment/carriers
 */
export async function getFulfillmentCarriers() {
  try {
    const { data } = await api.get('/fulfillment/carriers', { skipErrorRedirect: true });
    return unwrapData(data) || [];
  } catch (err) {
    try {
      const { data } = await api.get('/shipping/partners', { skipErrorRedirect: true });
      return unwrapData(data) || [];
    } catch {
      return [];
    }
  }
}

// ==========================================
// WAREHOUSES APIs — /api/v1/warehouses
// ==========================================

/**
 * 6. Danh sách kho hàng — GET /warehouses
 */
export async function getWarehouses(params = {}) {
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
 * 7. Chi tiết kho hàng — GET /warehouses/{warehouseId}
 */
export async function getWarehouseById(warehouseId) {
  const { data } = await api.get(`/warehouses/${warehouseId}`, { skipErrorRedirect: true });
  return unwrapData(data);
}

/**
 * 8. Tạo kho hàng mới — POST /warehouses
 */
export async function createWarehouse(payload) {
  const { data } = await api.post('/warehouses', payload);
  return unwrapData(data);
}

/**
 * 9. Cập nhật kho hàng — PUT /warehouses/{warehouseId}
 */
export async function updateWarehouse(warehouseId, payload, rowVersion) {
  const headers = rowVersion ? { 'If-Match': rowVersion } : {};
  const { data } = await api.put(`/warehouses/${warehouseId}`, payload, { headers });
  return unwrapData(data);
}

/**
 * 10. Đổi trạng thái kho hàng — PATCH /warehouses/{warehouseId}/status
 */
export async function updateWarehouseStatus(warehouseId, status, rowVersion) {
  const headers = rowVersion ? { 'If-Match': rowVersion } : {};
  const body = typeof status === 'object' ? status : { status, isActive: status === 'ACTIVE' || status === true };
  const { data } = await api.patch(`/warehouses/${warehouseId}/status`, body, { headers });
  return unwrapData(data);
}

/**
 * 11. Xóa kho hàng — DELETE /warehouses/{warehouseId}
 */
export async function deleteWarehouse(warehouseId, rowVersion) {
  const headers = rowVersion ? { 'If-Match': rowVersion } : {};
  const { data } = await api.delete(`/warehouses/${warehouseId}`, { headers });
  return unwrapData(data);
}
