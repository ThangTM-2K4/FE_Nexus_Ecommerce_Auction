import api from '../config/api';
import { unwrapData, unwrapPagedList, getApiErrorMessage } from '../utils/apiResponse';
import { formatPrice } from '../utils/formatPrice';

export { getApiErrorMessage };

/**
 * Chuẩn hóa đối tượng phiên đấu giá từ backend sang định dạng UI Frontend
 */
export function mapBackendAuctionToUi(item) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title || item.name || "Phiên đấu giá",
    description: item.description || "Mô tả phiên đấu giá",
    category: item.categoryName || item.category || "Danh mục",
    categoryLabel: item.categoryName || item.category || "Danh mục",
    currentBid: item.currentPrice ?? item.currentBid ?? item.startingPrice ?? 0,
    currentPrice: item.currentPrice ? formatPrice(item.currentPrice) : formatPrice(item.startingPrice || 0),
    startingPrice: item.startingPrice ?? 0,
    bidIncrement: item.bidIncrement ?? 500000,
    depositAmount: item.depositAmount ?? 1000000,
    image: item.imageUrl || item.image || "/images/auction/default.png",
    images: item.images || [item.imageUrl || "/images/auction/default.png"],
    location: item.location || "TP.HCM",
    postedAt: item.startTime ? new Date(item.startTime).getTime() : Date.now() - 3600000,
    endTime: item.endTime ? new Date(item.endTime).getTime() : Date.now() + 86400000,
    isUpcoming: item.status === "Upcoming" || (item.startTime && new Date(item.startTime).getTime() > Date.now()),
    listingType: item.listingType || "Cá nhân",
    isRealBackend: true,
  };
}

/**
 * Lấy danh sách phiên đấu giá từ backend /api/v1/auctions
 */
export async function getAuctions(params = {}) {
  const { data } = await api.get('/auctions', { params });
  const paged = unwrapPagedList(data);
  return {
    ...paged,
    items: (paged.items || []).map(mapBackendAuctionToUi).filter(Boolean),
  };
}

/**
 * Tạo phiên đấu giá mới /api/v1/auctions
 */
export async function createAuction(payload) {
  const { data } = await api.post('/auctions', payload);
  return unwrapData(data);
}

/**
 * Chi tiết phiên đấu giá /api/v1/auctions/{id}
 */
export async function getAuctionById(id) {
  const { data } = await api.get(`/auctions/${id}`);
  const res = unwrapData(data);
  return mapBackendAuctionToUi(res);
}

/**
 * Cấu hình phiên đấu giá /api/v1/auctions/{id}/configuration
 */
export async function configureAuction(id, config) {
  const { data } = await api.put(`/auctions/${id}/configuration`, config);
  return unwrapData(data);
}

/**
 * Hủy phiên đấu giá /api/v1/auctions/{id}/cancel
 */
export async function cancelAuction(id, reason) {
  const { data } = await api.post(`/auctions/${id}/cancel`, { reason });
  return unwrapData(data);
}

/**
 * Danh sách lượt đặt giá /api/v1/auctions/{auctionId}/bids
 */
export async function getAuctionBids(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/bids`);
  const paged = unwrapPagedList(data);
  return paged.items ?? [];
}

/**
 * Đặt giá đấu giá (Place Bid) /api/v1/auctions/{auctionId}/bids
 */
export async function placeBid(auctionId, amount) {
  const { data } = await api.post(`/auctions/${auctionId}/bids`, { amount });
  return unwrapData(data);
}

/**
 * Giá hiện tại realtime /api/v1/auctions/{auctionId}/current-price
 */
export async function getAuctionCurrentPrice(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/current-price`);
  return unwrapData(data);
}

/**
 * Đăng ký tham gia đấu giá (nộp cọc) /api/v1/auctions/{auctionId}/registrations
 */
export async function registerAuction(auctionId) {
  const { data } = await api.post(`/auctions/${auctionId}/registrations`);
  return unwrapData(data);
}

/**
 * Trạng thái đăng ký cá nhân /api/v1/auctions/{auctionId}/registrations/me
 */
export async function getMyAuctionRegistration(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/registrations/me`);
  return unwrapData(data);
}

/**
 * Quyết toán kết quả /api/v1/auctions/{auctionId}/settlement
 */
export async function getAuctionSettlement(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/settlement`);
  return unwrapData(data);
}

/**
 * Kết quả phiên đấu giá /api/v1/auctions/{auctionId}/result
 */
export async function getAuctionResult(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/result`);
  return unwrapData(data);
}
