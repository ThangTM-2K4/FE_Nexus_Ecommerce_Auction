import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

/**
 * Lấy danh sách đề xuất đấu giá
 * scope='mine'   → Seller xem proposals của mình
 * scope='staff'  → Admin/Staff xem tất cả proposals cần duyệt
 * GET /api/v1/auction/proposals
 */
export async function getAuctionProposals(params = {}) {
  try {
    const { data } = await api.get('/auction/proposals', { params, skipErrorRedirect: true });
    return unwrapPagedList(data);
  } catch {
    return { items: [], total: 0, totalCount: 0 };
  }
}

/**
 * Chi tiết đề xuất đấu giá GET /api/v1/auction/proposals/{id}
 */
export async function getAuctionProposalById(id) {
  const { data } = await api.get(`/auction/proposals/${id}`, { skipErrorRedirect: true });
  return unwrapData(data);
}

/**
 * Seller nộp hồ sơ đấu giá mới (multipart/form-data)
 * POST /api/v1/auction/proposals/applications
 *
 * @param {FormData} formData - multipart/form-data bao gồm (PascalCase theo C# schema):
 *   - Title (string)
 *   - CategoryId (uuid string)
 *   - Brand (string)
 *   - Condition (string: NEW | LIKE_NEW | GOOD | USED)
 *   - Description (string)
 *   - StartPrice (number)
 *   - ReservePrice (number, >= StartPrice)
 *   - BidIncrement (number)
 *   - StartDate (ISO date-time, must be future)
 *   - EndDate (ISO date-time, duration 24h-14d from StartDate)
 *   - AgreeRules (boolean string 'true')
 *   - Images[] (File[]) — ảnh sản phẩm
 *   - Documents[] (File[]) — giấy tờ liên quan
 */
export async function createAuctionApplication(formData) {
  const { data } = await api.post('/auction/proposals/applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    skipErrorRedirect: true,
  });
  return unwrapData(data);
}

/**
 * @deprecated Dùng createAuctionApplication() thay thế
 * Kept for backward compat — gọi createAuctionApplication với JSON body (không có file)
 */
export async function createAuctionProposal(payload) {
  try {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    return await createAuctionApplication(fd);
  } catch {
    return null;
  }
}

/**
 * Seller xuất bản Proposal đã được Admin duyệt → tạo Auction SCHEDULED
 * POST /api/v1/auction/proposals/{id}/publish
 */
export async function publishProposal(id, payload = {}) {
  const { data } = await api.post(`/auction/proposals/${id}/publish`, payload, { skipErrorRedirect: true });
  return unwrapData(data);
}
