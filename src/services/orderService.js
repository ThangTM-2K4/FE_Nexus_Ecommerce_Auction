import { MOCK_ORDERS } from '../data/mockOrders';
import { mockDelay } from './mockDelay';

export const ORDER_STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending_payment', label: 'Chờ thanh toán' },
  { key: 'shipping', label: 'Vận chuyển' },
  { key: 'delivering', label: 'Chờ giao hàng' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'return', label: 'Trả hàng/Hoàn tiền' },
];

export const getOrders = async (_userId, { status = 'all', query = '' } = {}) => {
  await mockDelay(400);

  let list = [...MOCK_ORDERS];

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

  return list;
};

