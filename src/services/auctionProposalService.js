import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

/**
 * Danh sách đề xuất đấu giá từ Seller /api/v1/auction/proposals
 */
export async function getAuctionProposals(params = {}) {
  try {
    const { data } = await api.get('/auction/proposals', { params });
    return unwrapPagedList(data);
  } catch {
    return { items: [], total: 0 };
  }
}

/**
 * Tạo đề xuất phiên đấu giá mới
 */
export async function createAuctionProposal(payload) {
  const { data } = await api.post('/auction/proposals', payload);
  return unwrapData(data);
}

/**
 * Chi tiết đề xuất đấu giá /api/v1/auction/proposals/{id}
 */
export async function getAuctionProposalById(id) {
  const { data } = await api.get(`/auction/proposals/${id}`);
  return unwrapData(data);
}

/**
 * Gửi đề xuất đấu giá lên Admin chờ duyệt /api/v1/auction/proposals/{id}/submit
 */
export async function submitAuctionProposal(id) {
  const { data } = await api.post(`/auction/proposals/${id}/submit`);
  return unwrapData(data);
}
