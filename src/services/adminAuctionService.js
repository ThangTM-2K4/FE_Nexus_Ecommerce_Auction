import api from '../config/api';
import { unwrapData, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

/**
 * Admin duyệt đề xuất đấu giá /api/v1/admin/auction/proposals/{id}/approve
 */
export async function approveAuctionProposal(id, payload = {}) {
  const { data } = await api.post(`/admin/auction/proposals/${id}/approve`, payload);
  return unwrapData(data);
}

/**
 * Admin từ chối đề xuất đấu giá /api/v1/admin/auction/proposals/{id}/reject
 */
export async function rejectAuctionProposal(id, reason) {
  const { data } = await api.post(`/admin/auction/proposals/${id}/reject`, { reason });
  return unwrapData(data);
}

/**
 * Admin công khai phiên đấu giá /api/v1/admin/auctions/{id}/publish
 */
export async function publishAuction(id, payload = {}) {
  const { data } = await api.post(`/admin/auctions/${id}/publish`, payload);
  return unwrapData(data);
}

/**
 * Admin đối soát phiên đấu giá /api/v1/admin/auctions/{id}/reconcile
 */
export async function reconcileAuction(id) {
  const { data } = await api.post(`/admin/auctions/${id}/reconcile`);
  return unwrapData(data);
}

/**
 * Admin trạng thái vận hành phiên /api/v1/admin/auction-operations/{operationKey}
 */
export async function getAuctionOperationStatus(operationKey) {
  const { data } = await api.get(`/admin/auction-operations/${operationKey}`);
  return unwrapData(data);
}
