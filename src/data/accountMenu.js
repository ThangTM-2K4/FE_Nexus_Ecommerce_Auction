/** Cấu hình sidebar — giữ nguyên thứ tự menu theo yêu cầu */
export const ACCOUNT_MENU = [
  {
    key: 'notifications',
    label: 'Thông Báo',
    path: '/profile/notifications',
  },
  {
    key: 'account',
    label: 'Tài Khoản Của Tôi',
    children: [
      { key: 'profile', label: 'Hồ Sơ', path: '/profile' },
      { key: 'bank', label: 'Ngân Hàng', path: '/profile/bank' },
      { key: 'address', label: 'Địa Chỉ', path: '/profile/address' },
      { key: 'password', label: 'Đổi Mật Khẩu', path: '/profile/change-password' },
      { key: 'notification-settings', label: 'Cài Đặt Thông Báo', path: '/profile/notification-settings' },
      { key: 'privacy', label: 'Những Thiết Lập Riêng Tư', path: '/profile/privacy' },
      { key: 'personal-info', label: 'Thông Tin Cá Nhân', path: '/profile/personal-info' },
    ],
  },
  {
    key: 'orders',
    label: 'Đơn Mua',
    path: '/profile/orders',
  },
];
