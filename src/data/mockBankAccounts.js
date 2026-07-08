/** Đổi USE_MOCK_BANK_ACCOUNTS = false để test state rỗng */
export const USE_MOCK_BANK_ACCOUNTS = false;

export const MOCK_BANK_ACCOUNTS = [
  {
    id: 'bank-1',
    bankCode: 'VCB',
    bankName: 'Vietcombank',
    branchName: 'Chi nhánh TP. Hồ Chí Minh',
    accountNumber: '0123456789',
    accountHolder: 'NGUYEN VAN AN',
    nationalId: '079123456789',
    isDefault: true,
  },
];

export const BANK_OPTIONS = [
  { value: 'VCB', label: 'Vietcombank' },
  { value: 'TCB', label: 'Techcombank' },
  { value: 'MB', label: 'MB Bank' },
  { value: 'ACB', label: 'ACB' },
  { value: 'BIDV', label: 'BIDV' },
];

export const BRANCH_OPTIONS = {
  VCB: [
    { value: 'hcm', label: 'Chi nhánh TP. Hồ Chí Minh' },
    { value: 'hn', label: 'Chi nhánh Hà Nội' },
  ],
  TCB: [
    { value: 'hcm', label: 'Chi nhánh Quận 1' },
    { value: 'q7', label: 'Chi nhánh Quận 7' },
  ],
  MB: [{ value: 'hcm', label: 'Chi nhánh Hồ Chí Minh' }],
  ACB: [{ value: 'hcm', label: 'Chi nhánh Sài Gòn' }],
  BIDV: [{ value: 'hcm', label: 'Chi nhánh TP. Hồ Chí Minh' }],
};
