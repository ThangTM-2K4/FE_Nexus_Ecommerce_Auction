import api from '../config/api';
import { unwrapData } from '../utils/apiResponse';
import { MOCK_ORDERS } from '../data/mockOrders';
import { mockDelay } from './mockDelay';

const storageKey = (userId) => `orders_${userId}`;

const getStored = (userId) => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
};

const save = (userId, list) => {
  localStorage.setItem(storageKey(userId), JSON.stringify(list));
};

export const ORDER_STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'cho_xac_nhan', label: 'Chờ xác nhận' },
  { key: 'pending_payment', label: 'Chờ thanh toán' },
  { key: 'shipping', label: 'Vận chuyển' },
  { key: 'delivering', label: 'Chờ giao hàng' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'return', label: 'Trả hàng/Hoàn tiền' },
];

export const getOrders = async (userId, { status = 'all', query = '' } = {}) => {
  await mockDelay(400);

  let list = [...getStored(userId), ...MOCK_ORDERS];

  if (status !== 'all') {
    list = list.filter((order) => order.status === status);
  }

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(
      (order) =>
        order.id.toLowerCase().includes(q) ||
        order.shopName.toLowerCase().includes(q) ||
        order.products.some((p) => p.name.toLowerCase().includes(q)),
    );
  }

  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const createOrder = async (userId, orderData) => {
  await mockDelay(300);

  const shopNames = [...new Set(orderData.items.map((i) => i.shopName))];
  const shopName = shopNames.length === 1 ? shopNames[0] : `${shopNames.length} cửa hàng`;

  const newOrder = {
    id: `ORD-${Date.now()}`,
    shopName,
    status: orderData.paymentMethod === 'vnpay' ? 'pending_payment' : 'cho_xac_nhan',
    total: orderData.totalPrice,
    subtotal: orderData.subtotal,
    shippingFee: orderData.shippingFee,
    createdAt: new Date().toISOString(),
    address: orderData.address,
    paymentMethod: orderData.paymentMethod,
    note: orderData.note || '',
    products: orderData.items.map((item) => ({
      id: item.productId,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
      variant: item.variant,
    })),
    items: orderData.items,
  };

  const list = [newOrder, ...getStored(userId)];
  save(userId, list);
  return newOrder;
};

export const updateOrderStatus = async (userId, orderId, status) => {
  const list = getStored(userId);
  const updated = list.map((order) => {
    if (order.id === orderId) {
      return { ...order, status };
    }
    return order;
  });
  save(userId, updated);

  // Also update MOCK_ORDERS in memory if present
  const mockItem = MOCK_ORDERS.find((o) => o.id === orderId);
  if (mockItem) {
    mockItem.status = status;
  }

  return updated.find((o) => o.id === orderId);
};

export const markOrderPaid = async (userId, orderId) => {
  return updateOrderStatus(userId, orderId, 'cho_xac_nhan');
};

export const payOrderWithWallet = async (userId, orderId, amount) => {
  await mockDelay(300);
  // Mark order as paid
  await updateOrderStatus(userId, orderId, 'cho_xac_nhan');
  return { success: true };
};

/**
 * Khởi tạo thanh toán VNPAY trực tiếp cho đơn hàng qua API backend POST /api/v1/orders/{orderId}/payments
 * và chuyển hướng người dùng sang trang thanh toán VNPay.
 */
export async function initiateVnPayPayment(orderId, amount) {
  const returnUrl = `${window.location.origin}/profile/orders?payment_return=vnpay&vnp_ResponseCode=00&status=cho_xac_nhan&orderId=${orderId}`;
  const cancelUrl = `${window.location.origin}/profile/orders?payment_return=vnpay&vnp_ResponseCode=24&status=pending_payment&orderId=${orderId}`;
  const idempotencyKey = `vnpay-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  try {
    // 1. Gọi API thanh toán đơn hàng POST /api/v1/orders/{orderId}/payments
    const { data } = await api.post(
      `/orders/${orderId}/payments`,
      {
        provider: 'VNPAY',
        paymentMethod: 'VNPAY_QR',
        returnUrl,
        cancelUrl,
      },
      {
        headers: { 'Idempotency-Key': idempotencyKey },
      }
    );
    const result = unwrapData(data);
    const paymentUrl = result?.paymentUrl || result?.checkoutUrl || result?.redirectUrl || result?.url;
    if (paymentUrl) return paymentUrl;
  } catch (err) {
    console.warn('API /orders/{id}/payments not available or failed, redirecting to VNPay payment gateway...', err);
  }

  // 2. Chuyển sang Cổng VNPay Sandbox cho ĐƠN HÀNG (Không gọi nạp ví)
  const vnpaySandboxHost = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const queryParams = new URLSearchParams({
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: 'NEXUS001',
    vnp_Amount: String(Math.round((amount || 100000) * 100)),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: String(orderId || Date.now()),
    vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: returnUrl,
  });

  return `${vnpaySandboxHost}?${queryParams.toString()}`;
}



