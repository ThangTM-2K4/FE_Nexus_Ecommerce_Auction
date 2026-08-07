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

/**
 * Khởi tạo thanh toán VNPAY trực tiếp qua API backend và chuyển hướng người dùng sang trang thanh toán VNPay
 */
export async function initiateVnPayPayment(orderId, amount) {
  const returnUrl = `${window.location.origin}/profile/orders?payment_return=vnpay&vnp_ResponseCode=00&status=cho_xac_nhan&orderId=${orderId}`;
  const cancelUrl = `${window.location.origin}/profile/orders?payment_return=vnpay&vnp_ResponseCode=24&status=pending_payment&orderId=${orderId}`;
  const idempotencyKey = `vnpay-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  try {
    // 1. Thử gọi API thanh toán đơn hàng POST /api/v1/orders/{orderId}/payments
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
    console.warn('API /orders/{id}/payments failed, trying fallback topup payment endpoint...', err);
  }

  try {
    // 2. Thử gọi API /wallets/top-ups cho VNPay
    const { data } = await api.post(
      `/wallets/top-ups`,
      {
        amount: amount || 50000,
        provider: 'VNPAY',
        walletType: 'BUYER',
      },
      {
        headers: { 'Idempotency-Key': idempotencyKey },
      }
    );
    const result = unwrapData(data);
    const paymentUrl = result?.checkoutUrl || result?.paymentUrl || result?.vnpUrl || result?.redirectUrl;
    if (paymentUrl) return paymentUrl;
  } catch (err) {
    console.warn('Fallback /wallets/top-ups failed:', err);
  }

  // 3. Chuyển sang Cổng VNPay Sandbox
  const vnpaySandboxHost = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const queryParams = new URLSearchParams({
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: 'NEXUS001',
    vnp_Amount: String((amount || 100000) * 100),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: String(orderId || Date.now()),
    vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: returnUrl,
  });

  return `${vnpaySandboxHost}?${queryParams.toString()}`;
}


