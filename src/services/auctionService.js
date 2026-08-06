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
    title: item.title || item.name || item.productName || 'Phiên đấu giá',
    description: item.description || 'Mô tả phiên đấu giá',
    category: item.categoryName || item.category || 'Danh mục',
    categoryLabel: item.categoryName || item.category || 'Danh mục',
    categoryId: item.categoryId,
    currentBid: item.currentPrice ?? item.currentBid ?? item.startingPrice ?? 0,
    currentPrice: item.currentPrice ? formatPrice(item.currentPrice) : formatPrice(item.startingPrice || 0),
    startingPrice: item.startingPrice ?? 0,
    bidIncrement: item.bidIncrement ?? 500000,
    depositAmount: item.depositAmount ?? 1000000,
    reservePrice: item.reservePrice ?? null,
    image: item.imageUrl || item.image || item.coverImageUrl || '/images/auction/default.png',
    images: item.images || [item.imageUrl || item.coverImageUrl || '/images/auction/default.png'],
    location: item.location || 'TP.HCM',
    postedAt: item.startTime ? new Date(item.startTime).getTime() : Date.now() - 3600000,
    endTime: item.endTime ? new Date(item.endTime).getTime() : Date.now() + 86400000,
    startTime: item.startTime ? new Date(item.startTime).getTime() : Date.now(),
    isUpcoming: item.status === 'SCHEDULED' || item.status === 'Upcoming' || (item.startTime && new Date(item.startTime).getTime() > Date.now()),
    isLive: item.status === 'LIVE',
    isEnded: item.status === 'ENDED' || item.status === 'CANCELLED',
    status: item.status,
    listingType: item.listingType || 'Cá nhân',
    seller: item.sellerName || item.seller || item.shopName || 'Người bán',
    sellerId: item.sellerId,
    totalBids: item.totalBids ?? item.bidCount ?? 0,
    totalRegistrations: item.totalRegistrations ?? item.registrationCount ?? 0,
    rowVersion: item.rowVersion,
    isRealBackend: true,
  };
}

/**
 * Lấy danh sách phiên đấu giá từ backend GET /api/v1/auctions
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
 * Chi tiết phiên đấu giá GET /api/v1/auctions/{id}
 */
export async function getAuctionById(id) {
  const { data } = await api.get(`/auctions/${id}`);
  const res = unwrapData(data);
  return mapBackendAuctionToUi(res);
}

/**
 * Trang LIVE — giá hiện tại, rowVersion, allowed actions GET /api/v1/auctions/{id}/live-view
 */
export async function getAuctionLiveView(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/live-view`);
  return unwrapData(data);
}

/**
 * Giá hiện tại realtime GET /api/v1/auctions/{auctionId}/current-price
 */
export async function getAuctionCurrentPrice(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/current-price`);
  return unwrapData(data);
}

/**
 * Kết quả phiên đấu giá GET /api/v1/auctions/{auctionId}/result
 */
export async function getAuctionResult(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/result`);
  return unwrapData(data);
}

/**
 * Danh sách lượt đặt giá GET /api/v1/auctions/{auctionId}/bids
 */
export async function getAuctionBids(auctionId, params = {}) {
  const { data } = await api.get(`/auctions/${auctionId}/bids`, { params });
  const paged = unwrapPagedList(data);
  return paged.items ?? [];
}

/**
 * Đặt giá (Place Bid) POST /api/v1/auctions/{auctionId}/bids
 * @param {string} auctionId
 * @param {number} amount
 * @param {string} expectedBidHeadRowVersion - Base64 rowVersion từ live-view
 * @param {string} [currency]
 * @param {string} [idempotencyKey] - UUID duy nhất cho mỗi lần đặt giá
 */
export async function placeBid(auctionId, amount, expectedBidHeadRowVersion, currency = 'VND', idempotencyKey) {
  const key = idempotencyKey || crypto.randomUUID();
  const { data } = await api.post(
    `/auctions/${auctionId}/bids`,
    {
      amount,
      currency,
      expectedBidHeadRowVersion: expectedBidHeadRowVersion ?? null,
      sourceChannel: 'WEB',
    },
    {
      headers: { 'Idempotency-Key': key },
    }
  );
  return unwrapData(data);
}

/**
 * Đăng ký tham gia đấu giá (nộp cọc) POST /api/v1/auctions/{auctionId}/registrations
 */
export async function registerAuction(auctionId, idempotencyKey) {
  const key = idempotencyKey || crypto.randomUUID();
  const { data } = await api.post(
    `/auctions/${auctionId}/registrations`,
    {},
    {
      headers: { 'Idempotency-Key': key },
    }
  );
  return unwrapData(data);
}

/**
 * Trạng thái đăng ký cá nhân GET /api/v1/auctions/{auctionId}/registrations/me
 */
export async function getMyAuctionRegistration(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/registrations/me`);
  return unwrapData(data);
}

/**
 * Hủy phiên đấu giá POST /api/v1/auctions/{id}/cancel
 */
export async function cancelAuction(id, { reasonCode, reason, expectedRowVersion } = {}) {
  const { data } = await api.post(`/auctions/${id}/cancel`, {
    reasonCode: reasonCode || 'OTHER',
    reason: reason || 'Hủy phiên đấu giá',
    expectedRowVersion: expectedRowVersion ?? null,
  });
  return unwrapData(data);
}

/**
 * Quyết toán kết quả GET /api/v1/auctions/{auctionId}/settlement
 */
export async function getAuctionSettlement(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/settlement`);
  return unwrapData(data);
}

/**
 * Hoạt động đấu giá của tôi GET /api/v1/auction/me/activities
 */
export async function getMyAuctionActivities(params = {}) {
  try {
    const { data } = await api.get('/auction/me/activities', { params, skipErrorRedirect: true });
    return unwrapData(data) ?? [];
  } catch {
    return [];
  }
}

/**
 * Đơn hàng trúng đấu giá GET /api/v1/auctions/{id}/winner-order
 */
export async function getWinnerOrder(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/winner-order`);
  return unwrapData(data);
}

/**
 * Tổng quan đơn hàng trúng GET /api/v1/auctions/{id}/winner-order-summary
 */
export async function getWinnerOrderSummary(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/winner-order-summary`);
  return unwrapData(data);
}

/**
 * Trạng thái thanh toán đơn trúng GET /api/v1/auctions/{id}/winner-order/payment-status
 */
export async function getWinnerOrderPaymentStatus(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/winner-order/payment-status`);
  return unwrapData(data);
}

/**
 * Cập nhật địa chỉ giao hàng của winner PUT /api/v1/auctions/{id}/winner-order/delivery-address
 */
export async function updateWinnerDeliveryAddress(auctionId, addressBody) {
  // FE không gửi buyerUserId
  const { buyerUserId, ...body } = addressBody;
  const { data } = await api.put(`/auctions/${auctionId}/winner-order/delivery-address`, body);
  return unwrapData(data);
}

/**
 * Khởi tạo thanh toán VNPAY POST /api/v1/auctions/{id}/winner-order/payment
 * FE chuyển sang redirectUrl bằng window.location.assign()
 */
export async function initiateWinnerPayment(auctionId, { provider, paymentMethod, returnUrl, cancelUrl } = {}, idempotencyKey) {
  const key = idempotencyKey || crypto.randomUUID();
  const { data } = await api.post(
    `/auctions/${auctionId}/winner-order/payment`,
    {
      provider: provider || 'VNPAY',
      paymentMethod: paymentMethod || 'VNPAY_QR',
      returnUrl: returnUrl || `${window.location.origin}/auction/payment-return`,
      cancelUrl: cancelUrl || `${window.location.origin}/auction/payment-cancel`,
    },
    {
      headers: { 'Idempotency-Key': key },
    }
  );
  return unwrapData(data);
}
