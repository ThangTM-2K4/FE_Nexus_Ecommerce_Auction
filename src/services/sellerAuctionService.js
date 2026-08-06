import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';

export { getApiErrorMessage };

/**
 * Seller xem live view phiên của mình (dữ liệu mask)
 * GET /api/v1/seller/auctions/{id}/live-view
 */
export async function getSellerAuctionLiveView(auctionId) {
  const { data } = await api.get(`/seller/auctions/${auctionId}/live-view`);
  return unwrapData(data);
}

/**
 * Seller xem danh sách người đăng ký
 * GET /api/v1/seller/auctions/{auctionId}/registrations
 */
export async function getSellerAuctionRegistrations(auctionId, params = {}) {
  const { data } = await api.get(`/seller/auctions/${auctionId}/registrations`, { params });
  const paged = unwrapPagedList(data);
  return paged.items ?? unwrapData(data) ?? [];
}

/**
 * Seller xem kết quả sau đấu giá
 * GET /api/v1/seller/auctions/{id}/post-auction
 */
export async function getSellerPostAuction(auctionId) {
  const { data } = await api.get(`/seller/auctions/${auctionId}/post-auction`);
  return unwrapData(data);
}
