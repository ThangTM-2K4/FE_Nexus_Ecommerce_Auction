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

export function countLiveAuctions(listings = []) {
  return listings.filter((item) => {
    const end = item.endTime || 0;
    const liveFlag = item.isLive ?? item.status === 'LIVE';
    return liveFlag && end > Date.now();
  }).length;
}

/** Chi tiết phiên đấu giá — format đầy đủ cho AuctionDetailPage */
export function mapAuctionDetailToUi(item) {
  const base = mapBackendAuctionToUi(item);
  if (!base) return null;
  const categoryLabel = base.categoryLabel || base.category || 'ĐẤU GIÁ';
  return {
    ...base,
    currentPrice: base.currentPrice || formatPrice(base.currentBid || base.startingPrice || 0),
    breadcrumbs: ['TRANG CHỦ', String(categoryLabel).toUpperCase(), base.title],
    sellerAvatar: item.sellerAvatarUrl || item.sellerAvatar || '/images/avatars/seller.png',
    sellerBadge: item.sellerBadge || 'NGƯỜI BÁN UY TÍN',
    sellerVerified: item.sellerVerified ?? true,
    leader: item.leaderName || item.currentLeaderName || item.winningBidderName || 'Chưa có lượt đặt giá',
    leaderAvatar: item.leaderAvatarUrl || item.leaderAvatar || '',
    badge: base.isEnded ? 'ĐÃ KẾT THÚC' : base.isLive ? 'LIVE' : 'SẮP DIỄN RA',
    timeLeft: base.endTime ? Math.max(0, Math.floor((base.endTime - Date.now()) / 1000)) : 0,
    specs: {
      brand: item.brand,
      condition: item.condition,
      movement: item.movement,
      year: item.year,
    },
    bidHistory: [],
    brand: item.brand,
    condition: item.condition,
    movement: item.movement,
    year: item.year,
  };
}

function formatBidRelativeTime(iso) {
  if (!iso) return 'Vừa xong';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return new Date(iso).toLocaleString('vi-VN');
}

/** Map bid API → UI bid history item */
export function mapBidToHistoryItem(bid, index = 0, isUsd = false) {
  const amount = bid.amount ?? bid.bidAmount ?? 0;
  const formatted = isUsd
    ? `$${Number(amount).toLocaleString('en-US')}`
    : `${Number(amount).toLocaleString('vi-VN')}đ`;
  const placedAt = bid.placedAtUtc || bid.createdAt || bid.bidAt;
  return {
    user: bid.bidderName || bid.userName || bid.maskedBidderName || bid.bidderDisplayName || '***',
    avatar: bid.bidderAvatarUrl || bid.avatar || '',
    amount: formatted,
    rawAmount: amount,
    time: formatBidRelativeTime(placedAt),
    isLeader: index === 0,
    userId: bid.bidderUserId || bid.userId,
    exactTime: placedAt ? new Date(placedAt).toLocaleString('vi-VN') : '',
    ip: bid.ipAddress || bid.ip,
    device: bid.deviceInfo || bid.device,
    method: bid.sourceChannel || bid.method || 'WEB',
    status: bid.isSuspicious || bid.suspicious ? '⚠️ Nghi vấn' : (bid.status || '✓ Hợp lệ'),
    attemptNum: bid.attemptNumber || bid.sequenceNumber,
  };
}

/** Map admin bid audit → UI feed item */
export function mapBidAuditToAdminFeed(bid, auctionTitle = '') {
  return {
    id: bid.id || bid.bidId || `${bid.auctionId}-${bid.placedAtUtc}`,
    bidder: bid.bidderName || bid.maskedBidderName || bid.bidderUserId || '***',
    auction: auctionTitle || bid.auctionId || bid.auctionTitle || '—',
    amount: bid.amount != null
      ? `${Number(bid.amount).toLocaleString('vi-VN')}đ`
      : (bid.amountFormatted || '—'),
    time: bid.placedAtUtc ? new Date(bid.placedAtUtc).toLocaleString('vi-VN') : '—',
    suspicious: Boolean(bid.isSuspicious || bid.suspicious),
    ip: bid.ipAddress || bid.ip || '—',
  };
}

/** Map settlement monitor / winner order → admin order card */
export function mapSettlementToAdminOrder(item, auction) {
  const winner = item.winnerName || item.winnerUserName || item.buyerName || '—';
  return {
    id: item.orderId || item.winnerOrderId || `${auction?.id}-order`,
    winner,
    auction: auction?.title || item.auctionTitle || auction?.id || '—',
    seller: auction?.seller || item.sellerName || '—',
    finalPrice: item.winningAmount != null
      ? `${Number(item.winningAmount).toLocaleString('vi-VN')}đ`
      : (item.finalPrice || '—'),
    paymentStatus: item.paymentStatus || item.paymentState || '—',
    deliveryStatus: item.deliveryStatus || item.shippingStatus || '—',
    createdAt: item.createdAtUtc || item.createdAt
      ? new Date(item.createdAtUtc || item.createdAt).toLocaleDateString('vi-VN')
      : '—',
  };
}

/** Map my activities → live auction card (my-bids current tab) */
export function mapActivityToLiveAuction(activity) {
  const isUsd = activity.currency === 'USD';
  const currentPrice = activity.currentPrice ?? activity.lastBidAmount ?? activity.startingPrice ?? 0;
  const formatted = isUsd
    ? `$${Number(currentPrice).toLocaleString('en-US')}`
    : `${Number(currentPrice).toLocaleString('vi-VN')} ₫`;
  let statusType = 'watching';
  let statusLabel = 'Đang theo dõi';
  if (activity.isLeading || activity.leadingStatus === 'LEADING') {
    statusType = 'leading';
    statusLabel = 'ĐANG DẪN ĐẦU';
  } else if (activity.isOutbid || activity.leadingStatus === 'OUTBID') {
    statusType = 'outbid';
    statusLabel = 'BỊ VƯỢT GIÁ';
  }
  return {
    id: activity.auctionId || activity.id,
    title: activity.title || activity.productName || 'Phiên đấu giá',
    image: activity.imageUrl || activity.image || '/images/auction/default.png',
    currentPrice: formatted,
    endTime: activity.endTimeUtc
      ? new Date(activity.endTimeUtc).getTime()
      : (activity.endTime || Date.now() + 86400000),
    status: { label: statusLabel, type: statusType },
    buttonStyle: statusType === 'leading' ? 'gold' : 'purple',
    bidIncrements: isUsd ? ['+$500', '+$1K', '+$5K'] : ['+500K', '+1M', '+5M'],
    bidHistory: (activity.recentBids || []).map((b, i) => mapBidToHistoryItem(b, i, isUsd)),
    rowVersion: activity.bidHeadRowVersion,
  };
}

/** Map winner order API → my-bids won tab */
export function mapWinnerOrderToUi(order, activity = {}) {
  const finalAmount = order.winningAmount ?? order.finalPrice ?? order.totalPayable ?? 0;
  return {
    id: order.orderId || order.id || `AUC-WIN-${activity.auctionId || order.auctionId}`,
    auctionId: activity.auctionId || order.auctionId,
    productTitle: activity.title || order.productTitle || order.title || 'Sản phẩm trúng thầu',
    productImage: activity.imageUrl || order.imageUrl || order.image || '/images/auction/default.png',
    finalPrice: `${Number(finalAmount).toLocaleString('vi-VN')} ₫`,
    startingPrice: order.startingPrice
      ? `${Number(order.startingPrice).toLocaleString('vi-VN')} ₫`
      : '—',
    depositAmount: order.depositAmount
      ? `${Number(order.depositAmount).toLocaleString('vi-VN')} ₫`
      : '—',
    paidAmount: order.totalPayable != null
      ? `${Number(order.totalPayable).toLocaleString('vi-VN')} ₫`
      : `${Number(finalAmount).toLocaleString('vi-VN')} ₫`,
    paidAt: order.paidAtUtc || order.paidAt || order.createdAtUtc || new Date().toISOString(),
    paymentMethod: order.paymentMethod || order.provider || 'VNPAY',
    status: ['COMPLETED', 'DELIVERED'].includes(String(order.orderStatus || order.status).toUpperCase())
      ? 'completed'
      : 'delivering',
    shippingCarrier: order.shippingCarrier || order.carrierName || '—',
    trackingCode: order.trackingCode || order.trackingNumber || 'Chưa có mã vận đơn',
    estimatedDeliveryDate: order.estimatedDeliveryDate || order.estimatedDeliveryAt || 'Chưa có thông tin',
    deliveryTimeSlot: order.deliveryTimeSlot || 'Giờ hành chính',
    address: {
      recipient: order.recipientName || order.buyerName || '—',
      phone: order.phone || order.recipientPhone || '',
      fullAddress: order.addressLine || order.fullAddress || '',
    },
    timeline: Array.isArray(order.timeline) ? order.timeline : [
      {
        time: order.createdAtUtc ? new Date(order.createdAtUtc).toLocaleString('vi-VN') : '—',
        text: 'Trúng đấu giá - Đơn hàng được tạo',
        done: true,
      },
    ],
  };
}

/** Map proposal API → admin auction card */
export function mapProposalToAdminCard(p) {
  const rawStatus = String(p.status || '').toUpperCase();
  let status = 'Chờ duyệt đề xuất';
  if (rawStatus === 'APPROVED') status = 'Đã duyệt';
  else if (rawStatus === 'REJECTED') status = 'Đã từ chối';
  else if (rawStatus === 'PUBLISHED' || rawStatus === 'SCHEDULED') status = 'Chuẩn bị đấu giá';
  else if (rawStatus === 'LIVE') status = 'Đang diễn ra';
  else if (rawStatus === 'ENDED') status = 'Hoàn thành';
  else if (rawStatus === 'CANCELLED') status = 'Đã hủy';
  return {
    id: p.id,
    title: p.title || p.productName || 'Đề xuất đấu giá',
    seller: p.sellerName || p.businessName || 'Seller',
    startPrice: `${Number(p.startingPrice || p.startPrice || 0).toLocaleString('vi-VN')}đ`,
    currentPrice: `${Number(p.currentPrice || p.startingPrice || p.startPrice || 0).toLocaleString('vi-VN')}đ`,
    highestBid: p.highestBid ? `${Number(p.highestBid).toLocaleString('vi-VN')}đ` : '—',
    winner: p.winnerName || '—',
    endTime: p.scheduledEndUtc
      ? new Date(p.scheduledEndUtc).toLocaleDateString('vi-VN')
      : 'Chờ duyệt',
    status,
    bids: p.totalBids ?? p.bidCount ?? 0,
    rowVersion: p.rowVersion,
    isProposal: true,
    image: p.imageUrl || p.coverImageUrl || '/images/auction/default.png',
  };
}

/** Map live auction API → admin card */
export function mapAuctionToAdminCard(a) {
  const ui = mapBackendAuctionToUi(a);
  if (!ui) return null;
  let status = 'Đang diễn ra';
  if (ui.isEnded) status = ui.status === 'CANCELLED' ? 'Đã hủy' : 'Hoàn thành';
  else if (ui.isUpcoming) status = 'Chuẩn bị đấu giá';
  return {
    id: ui.id,
    title: ui.title,
    seller: ui.seller,
    startPrice: `${Number(ui.startingPrice || 0).toLocaleString('vi-VN')}đ`,
    currentPrice: ui.currentPrice,
    highestBid: ui.currentPrice,
    winner: a.winnerName || '—',
    endTime: ui.endTime ? new Date(ui.endTime).toLocaleDateString('vi-VN') : '—',
    status,
    bids: ui.totalBids ?? 0,
    rowVersion: ui.rowVersion,
    isProposal: false,
    image: ui.image,
  };
}

/** Staff lookup row */
export function mapAuctionToStaffRow(a) {
  const ui = mapBackendAuctionToUi(a);
  if (!ui) return null;
  let status = 'Đang diễn ra';
  if (ui.isEnded) status = 'Hoàn thành';
  else if (ui.isUpcoming) status = 'Chuẩn bị';
  return {
    id: ui.id,
    title: ui.title,
    seller: ui.seller,
    currentPrice: ui.currentPrice,
    startPrice: `${Number(ui.startingPrice || 0).toLocaleString('vi-VN')}đ`,
    bids: ui.totalBids ?? 0,
    endTime: ui.endTime ? new Date(ui.endTime).toLocaleString('vi-VN') : '—',
    status,
    winner: a.winnerName || '—',
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
  const { data } = await api.get(`/auctions/${id}`, { skipErrorRedirect: true });
  const res = unwrapData(data);
  return mapAuctionDetailToUi(res);
}

/**
 * Trang LIVE — giá hiện tại, rowVersion, allowed actions GET /api/v1/auctions/{id}/live-view
 */
export async function getAuctionLiveView(auctionId) {
  const { data } = await api.get(`/auctions/${auctionId}/live-view`, { skipErrorRedirect: true });
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
      skipErrorRedirect: true,
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
      skipErrorRedirect: true,
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
  }, { skipErrorRedirect: true });
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
      skipErrorRedirect: true,
    }
  );
  return unwrapData(data);
}
