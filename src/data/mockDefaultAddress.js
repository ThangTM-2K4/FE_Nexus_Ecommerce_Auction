import { MOCK_ADDRESSES } from './mockAddresses';

/** Địa chỉ mặc định dùng cho Checkout */
export const getDefaultCheckoutAddress = () =>
  MOCK_ADDRESSES.find((a) => a.isDefault) || MOCK_ADDRESSES[0] || null;
