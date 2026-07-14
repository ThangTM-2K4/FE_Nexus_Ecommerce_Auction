/** Đổi USE_MOCK_ADDRESSES = false để test state rỗng */
export const USE_MOCK_ADDRESSES = true;

// Shape khớp API mới (User Service): recipientName / recipientPhone / province / ward / street.
export const MOCK_ADDRESSES = [
  {
    id: 'addr-1',
    recipientName: 'Nguyễn Văn An',
    recipientPhone: '0901234567',
    province: 'TP. Hồ Chí Minh',
    ward: 'Phường Bến Nghé',
    street: '123 Nguyễn Huệ',
    type: 'home',
    isDefault: true,
  },
  {
    id: 'addr-2',
    recipientName: 'Nguyễn Văn An',
    recipientPhone: '0909876543',
    province: 'Hà Nội',
    ward: 'Phường Dịch Vọng',
    street: '45 Xuân Thủy',
    type: 'office',
    isDefault: false,
  },
  {
    id: 'addr-3',
    recipientName: 'Trần Thị Bình',
    recipientPhone: '0912345678',
    province: 'Đà Nẵng',
    ward: 'Phường Hải Châu 1',
    street: '88 Lê Duẩn',
    type: 'home',
    isDefault: false,
  },
];

export const PROVINCE_OPTIONS = [
  { value: 'hcm', label: 'TP. Hồ Chí Minh' },
  { value: 'hn', label: 'Hà Nội' },
  { value: 'dn', label: 'Đà Nẵng' },
];

export const DISTRICT_OPTIONS = {
  hcm: [
    { value: 'q1', label: 'Quận 1' },
    { value: 'q3', label: 'Quận 3' },
    { value: 'q7', label: 'Quận 7' },
  ],
  hn: [
    { value: 'cg', label: 'Cầu Giấy' },
    { value: 'dd', label: 'Đống Đa' },
  ],
  dn: [
    { value: 'hc', label: 'Hải Châu' },
    { value: 'st', label: 'Sơn Trà' },
  ],
};
