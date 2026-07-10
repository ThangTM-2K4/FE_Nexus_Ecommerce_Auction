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
    status: 'cho_xac_nhan',
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
