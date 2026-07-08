/** Đổi USE_MOCK_ADDRESSES = false để test state rỗng */
export const USE_MOCK_ADDRESSES = true;

export const MOCK_ADDRESSES = [
  {
    id: 'addr-1',
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    addressLine: '123 Nguyễn Huệ, Phường Bến Nghé',
    type: 'home',
    isDefault: true,
  },
  {
    id: 'addr-2',
    fullName: 'Nguyễn Văn An',
    phone: '0909876543',
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    addressLine: '45 Xuân Thủy, Dịch Vọng',
    type: 'office',
    isDefault: false,
  },
  {
    id: 'addr-3',
    fullName: 'Trần Thị Bình',
    phone: '0912345678',
    province: 'Đà Nẵng',
    district: 'Hải Châu',
    addressLine: '88 Lê Duẩn',
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
