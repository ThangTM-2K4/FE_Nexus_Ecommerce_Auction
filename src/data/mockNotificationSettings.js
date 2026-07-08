export const DEFAULT_NOTIFICATION_SETTINGS = {
  email: {
    enabled: true,
    locked: true,
    items: {
      orderUpdates: { enabled: true, description: 'Nhận email khi đơn hàng có cập nhật trạng thái' },
      promotions: { enabled: true, description: 'Nhận email về khuyến mãi và ưu đãi mới' },
      surveys: { enabled: false, description: 'Nhận email mời tham gia khảo sát trải nghiệm' },
    },
  },
  sms: {
    enabled: true,
    locked: true,
    items: {
      promotions: { enabled: false, description: 'Nhận SMS về khuyến mãi từ Shop Auction' },
    },
  },
  zalo: {
    enabled: true,
    locked: true,
    items: {
      promotions: { enabled: true, description: 'Nhận thông báo khuyến mãi qua Zalo Shop Auction Việt Nam' },
    },
  },
};
