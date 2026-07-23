export const DEFAULT_NOTIFICATION_SETTINGS = {
  email: {
    enabled: true,
    locked: false,
    items: {
      orderUpdates: {
        enabled: true,
        description: 'Cập nhật về tình trạng vận chuyển của tất cả các đơn hàng',
      },
      promotions: {
        enabled: true,
        description: 'Cập nhật về các ưu đãi và khuyến mãi sắp tới',
      },
      surveys: {
        enabled: false,
        description: 'Đồng ý nhận khảo sát để cho chúng tôi được lắng nghe bạn',
      },
    },
  },
  sms: {
    enabled: true,
    locked: false,
    items: {
      promotions: {
        enabled: false,
        description: 'Cập nhật về các ưu đãi và khuyến mãi sắp tới',
      },
    },
  },
  zalo: {
    enabled: true,
    locked: false,
    items: {
      promotions: {
        enabled: true,
        description: 'Cập nhật về các ưu đãi và khuyến mãi sắp tới',
      },
    },
  },
};
