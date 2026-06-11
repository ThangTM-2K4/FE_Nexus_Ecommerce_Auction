import { mockDelay } from './mockDelay';

const notificationKey = (userId) => `mockNotifications_${userId}`;

const seedNotifications = [
  {
    id: 1,
    type: 'auction',
    title: 'Bạn đã bị vượt giá',
    message: 'Phiên đấu giá "Đồng hồ Urban Fit" có bid mới cao hơn của bạn.',
    read: false,
    createdAt: '2026-06-10T14:30:00',
  },
  {
    id: 2,
    type: 'auction',
    title: 'Đấu giá sắp kết thúc',
    message: 'Phiên "Tai nghe Bluetooth Pro X2" còn 15 phút.',
    read: false,
    createdAt: '2026-06-10T12:00:00',
  },
  {
    id: 3,
    type: 'order',
    title: 'Đơn hàng đã giao',
    message: 'Đơn #ORD-1024 đã được giao thành công.',
    read: true,
    createdAt: '2026-06-09T09:15:00',
  },
  {
    id: 4,
    type: 'order',
    title: 'Thanh toán thành công',
    message: 'Bạn đã thanh toán đơn hàng #ORD-1024.',
    read: false,
    createdAt: '2026-06-08T16:45:00',
  },
  {
    id: 5,
    type: 'system',
    title: 'Xác minh email',
    message: 'Vui lòng xác minh email để sử dụng đầy đủ tính năng.',
    read: false,
    createdAt: '2026-06-07T10:00:00',
  },
  {
    id: 6,
    type: 'system',
    title: 'Chào mừng đến Shop Auction',
    message: 'Tài khoản của bạn đã được tạo thành công.',
    read: true,
    createdAt: '2026-06-01T08:00:00',
  },
];

const getStored = (userId) => {
  const raw = localStorage.getItem(notificationKey(userId));
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* fall through */
    }
  }
  localStorage.setItem(notificationKey(userId), JSON.stringify(seedNotifications));
  return [...seedNotifications];
};

const save = (userId, notifications) => {
  localStorage.setItem(notificationKey(userId), JSON.stringify(notifications));
};

export const getNotifications = async (userId) => {
  await mockDelay(400);
  return getStored(userId);
};

export const markAsRead = async (userId, notificationId) => {
  await mockDelay(300);
  const list = getStored(userId);
  const updated = list.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  save(userId, updated);
  return updated;
};

export const markAllAsRead = async (userId) => {
  await mockDelay(400);
  const list = getStored(userId);
  const updated = list.map((n) => ({ ...n, read: true }));
  save(userId, updated);
  return updated;
};

export const getUnreadCount = async (userId) => {
  const list = await getNotifications(userId);
  return list.filter((n) => !n.read).length;
};
