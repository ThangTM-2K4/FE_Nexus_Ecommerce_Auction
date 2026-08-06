import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

/**
 * Admin/Staff duyệt đề xuất đấu giá
 * POST /api/v1/admin/auction/proposals/{id}/approve
 * Body: { reasonCode, reason, rowVersion }
 */
export async function approveAuctionProposal(id, { reasonCode, reason, rowVersion } = {}) {
  const { data } = await api.post(`/admin/auction/proposals/${id}/approve`, {
    reasonCode: reasonCode || 'APPROVED',
    reason: reason || 'Hồ sơ hợp lệ',
    rowVersion: rowVersion ?? null,
  });
  return unwrapData(data);
}

/**
 * Admin/Staff từ chối đề xuất đấu giá
 * POST /api/v1/admin/auction/proposals/{id}/reject
 * Body: { reasonCode, reason, rowVersion }
 */
export async function rejectAuctionProposal(id, { reasonCode, reason, rowVersion } = {}) {
  const { data } = await api.post(`/admin/auction/proposals/${id}/reject`, {
    reasonCode: reasonCode || 'DOCUMENT_INVALID',
    reason: reason || 'Hồ sơ chưa đạt yêu cầu',
    rowVersion: rowVersion ?? null,
  });
  return unwrapData(data);
}

/**
 * Admin đối soát phiên đấu giá
 * POST /api/v1/admin/auctions/{id}/reconcile
 */
export async function reconcileAuction(id, payload = {}) {
  const { data } = await api.post(`/admin/auctions/${id}/reconcile`, payload);
  return unwrapData(data);
}

/**
 * Admin theo dõi phiên LIVE
 * GET /api/v1/admin/auctions/{id}/live-monitor
 */
export async function getAuctionLiveMonitor(auctionId) {
  const { data } = await api.get(`/admin/auctions/${auctionId}/live-monitor`);
  return unwrapData(data);
}

/**
 * Admin kiểm toán lượt bid
 * GET /api/v1/admin/auctions/{id}/bid-audit
 */
export async function getAuctionBidAudit(auctionId, params = {}) {
  const { data } = await api.get(`/admin/auctions/${auctionId}/bid-audit`, { params });
  const paged = unwrapPagedList(data);
  return paged.items ?? unwrapData(data) ?? [];
}

/**
 * Admin giám sát settlement
 * GET /api/v1/admin/auctions/{id}/settlement-monitor
 */
export async function getAuctionSettlementMonitor(auctionId) {
  const { data } = await api.get(`/admin/auctions/${auctionId}/settlement-monitor`);
  return unwrapData(data);
}

/**
 * Admin kiểm tra trạng thái operation bất đồng bộ
 * GET /api/v1/admin/auction-operations/{operationKey}
 */
export async function getAuctionOperationStatus(operationKey) {
  const { data } = await api.get(`/admin/auction-operations/${operationKey}`);
  return unwrapData(data);
}

/**
 * Danh sách phiên đấu giá cho Admin
 * GET /api/v1/auctions (dùng chung với public, Admin có thêm context)
 */
export async function getAdminAuctions(params = {}) {
  try {
    const { data } = await api.get('/auctions', { params, skipErrorRedirect: true });
    return unwrapPagedList(data);
  } catch {
    return { items: [], total: 0 };
  }
}
